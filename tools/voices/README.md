# Offline Chatterbox voices

The game ships MP3 clips and needs no Python, GPU, credentials or speech service at runtime. Generation and audio validation require FFmpeg and ffprobe on PATH.

1. Create a Python 3.11 virtual environment `.venv-tts`.
2. Install `torch==2.7.1` and `torchaudio==2.7.1` from `https://download.pytorch.org/whl/cu128`. This build supports the RTX 5060 (Blackwell); Chatterbox's default torch 2.6 pin does not.
3. The full resolved environment is recorded in `requirements-lock.txt`. Install official Chatterbox commit `5de7a54aa4e5e2baadb0182dde554908b48b85c2` using uv with `--override tools/voices/torch-override.txt` to retain those CUDA builds. The source is `git+https://github.com/resemble-ai/chatterbox.git@5de7a54aa4e5e2baadb0182dde554908b48b85c2`.
4. Run `npm run voices:catalog`, then `npm run voices:generate`. Generation needs network access for the initial model download and access to `/dev/nvidia*`. Use `-- --limit 5` for a short run or `-- --speaker elon` for one character. Completed clips are skipped on subsequent runs.
5. Run `npm run test:voices`.

`catalog.js` enumerates the real story tables for every protagonist, opponent and fragment count. It combines existing name clips for all 81 versus pairings. `voice-key.js` shares text normalization with the browser. If script text changes, regenerate the catalog and run the generator: new text receives a new filename. Delete an individual MP3 to regenerate it after changing that clip's settings.

`generate.py` uses Multilingual V3 with explicit `en`, `pt` and `it` language codes. It loads the model once, sets a repeatable seed per line, adjusts exaggeration for reactions, and bakes modest character pitch changes into normalized mono 24 kHz MP3s. It does not send the script to a paid speech API or use real-person voice samples. Chatterbox applies its built-in PerTh watermark before audio processing.

Only compressed clips and `generation.json` ship. Model caches, WAV masters and the generation environment are ignored by Git. The upstream project is MIT licensed; see `CHATTERBOX-LICENSE.txt` in the distributed audio directory.
