#!/usr/bin/env python3
"""Generate the finite game script once with Chatterbox Multilingual; resume by file.

Run catalog.js first. Model caches and uncompressed masters stay in output/.
Only MP3 assets and their provenance are shipped in public/audio/voices/.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import random
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
os.environ.setdefault('TQDM_DISABLE', '1')
os.environ.setdefault('HF_HOME', str(ROOT / 'output/chatterbox/huggingface'))
os.environ.setdefault('XDG_CACHE_HOME', str(ROOT / 'output/chatterbox/cache'))
os.environ.setdefault('PKUSEG_HOME', str(ROOT / 'output/chatterbox/pkuseg'))
os.environ.setdefault('MPLCONFIGDIR', str(ROOT / 'output/chatterbox/matplotlib'))
os.environ.setdefault('NUMBA_CACHE_DIR', str(ROOT / 'output/chatterbox/numba'))

PITCH = {'announcer': 0.86, 'ann': 0.86, 'pt': 1.0, 'narrator': 1.0,
         'tralalero': 1.08, 'tung': 0.9, 'bombardiro': 0.84, 'ballerina': 1.28,
         'patapim': 0.82, 'chimp': 1.18, 'assassino': 0.8, 'lirili': 0.94,
         'saturnita': 0.76, 'parrot': 1.35, 'nonno': 0.96, 'elon': 0.98}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--limit', type=int)
    parser.add_argument('--speaker')
    parser.add_argument('--device', default='cuda', choices=['cuda', 'cpu'])
    args = parser.parse_args()
    import numpy as np
    import torch
    import soundfile as sf
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS

    torch.set_num_threads(4)
    if args.device == 'cuda':
        if not torch.cuda.is_available():
            raise RuntimeError('CUDA unavailable. Run with GPU device access, or explicitly pass --device cpu.')
        print('GPU:', torch.cuda.get_device_name(0), flush=True)
    catalog = json.loads((ROOT / 'output/voices/catalog.json').read_text())
    dest = ROOT / 'public/audio/voices'
    masters = ROOT / 'output/voices/masters'
    dest.mkdir(parents=True, exist_ok=True)
    masters.mkdir(parents=True, exist_ok=True)
    report_file = dest / 'generation.json'
    report = json.loads(report_file.read_text()) if report_file.exists() else {
        'engine': 'Chatterbox Multilingual V3',
        'source': 'https://github.com/resemble-ai/chatterbox',
        'source_revision': '5de7a54aa4e5e2baadb0182dde554908b48b85c2',
        'model': 'ResembleAI/chatterbox / t3_mtl23ls_v3.safetensors',
        'voice': 'Built-in synthetic voice, no real-person reference recordings',
        'watermark': 'PerTh applied by Chatterbox before pitch processing and MP3 encoding',
        'clips': {},
    }
    pending = [line for line in catalog if (not args.speaker or line['speaker'] == args.speaker)
               and not ((dest / line['file']).exists() and line['file'] in report['clips'])]
    if args.limit:
        pending = pending[:args.limit]
    print(f'{len(pending)} pending / {len(catalog)} total clips', flush=True)
    if not pending:
        return
    # Prioritize short playable feedback before longer story narration.
    pending.sort(key=lambda line: (line['speaker'] != 'elon', len(line['text'])))
    model = ChatterboxMultilingualTTS.from_pretrained(device=args.device, t3_model='v3')
    report['model_revision'] = (Path(os.environ['HF_HOME']) / 'hub/models--ResembleAI--chatterbox/refs/main').read_text().strip()
    start = time.monotonic()
    for index, line in enumerate(pending):
        seed = int(hashlib.sha256(line['key'].encode()).hexdigest()[:8], 16)
        random.seed(seed)
        np.random.seed(seed)
        torch.manual_seed(seed)
        attempt = 0
        text = line['text']
        master = masters / (Path(line['file']).stem + '.wav')
        if not line['key'].split(':', 1)[1]:
            samples = np.zeros(int(model.sr * 0.35), dtype=np.float32)
        else:
            for attempt in range(3):
                torch.manual_seed(seed + attempt)
                with torch.inference_mode():
                    wav = model.generate(text, language_id=line['language'],
                                         exaggeration=line['exaggeration'], cfg_weight=0.3,
                                         temperature=0.7 - attempt * 0.05,
                                         repetition_penalty=1.2 + attempt * 0.1)
                samples = wav.squeeze().detach().cpu().numpy()
                duration = len(samples) / model.sr
                valid = np.isfinite(samples).all() and np.max(np.abs(samples)) >= 0.005
                if valid and 0.15 <= duration <= max(15, len(text) * 0.2):
                    break
                print(f'Retrying invalid/overlong clip: {text[:50]}', flush=True)
            else:
                raise RuntimeError('Speech failed validation after 3 attempts: ' + text)
        sf.write(master, samples, model.sr)
        pitch = PITCH.get(line['speaker'], 1.0)
        # Character pitch is baked into the asset; playback runs at its natural speed.
        filters = f'asetrate={model.sr}*{pitch},aresample={model.sr},atempo={1/pitch},loudnorm=I=-18:TP=-2:LRA=9'
        if not line['key'].split(':', 1)[1]:
            filters = 'anull'  # Loudness normalization is undefined for intentional silence.
        target = dest / line['file']
        temporary = target.with_suffix('.tmp.mp3')
        subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-loglevel', 'error', '-y',
                        '-i', str(master), '-af', filters, '-ac', '1', '-ar', '24000',
                        '-codec:a', 'libmp3lame', '-b:a', '80k', str(temporary)], check=True)
        temporary.replace(target)
        report['clips'][line['file']] = {**line, 'seed': seed + attempt, 'pitch': pitch,
                                         'seconds': round(len(samples) / model.sr, 3),
                                         'cfg_weight': 0.3, 'temperature': 0.7 - attempt * 0.05,
                                         'repetition_penalty': 1.2 + attempt * 0.1}
        report_file.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
        print(f'[{index+1}/{len(pending)}] {line["language"]} {text[:68]} ({time.monotonic()-start:.0f}s)', flush=True)
        if args.device == 'cuda':
            torch.cuda.empty_cache()
    print('Generation complete.', flush=True)

if __name__ == '__main__':
    main()
