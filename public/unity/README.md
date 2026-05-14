# Unity WebGL Build

이 디렉토리의 4개 파일(`characterbuilder.{data,wasm,framework.js,loader.js}`)은
[qwerty2944/mud_web](https://github.com/qwerty2944/mud_web)의 Unity WebGL 빌드를 재사용한다.

크기가 크기 때문에 `.gitignore`에 등록되어 있다. 신규 클론 후:

```bash
git clone --depth 1 https://github.com/qwerty2944/mud_web /Users/ric/projects/mud_web_ref
./scripts/sync-unity.sh
```

또는 환경변수로 경로를 지정:

```bash
MUD_WEB_REF=/path/to/mud_web ./scripts/sync-unity.sh
```
