# Produce artifacts from a docker container

## Create source-code-only container

Change to whatever branch/commit you want to build and build the base docker image. Execute this from the git repo root:

```
DOCKER_IMAGE=emurgo/yoroi-mobile:src-at-$(git rev-parse HEAD | head -c7)
docker build -t emurgo/yoroi-mobile:${DOCKER_IMAGE} -f Dockerfile.src .
docker tag ${DOCKER_IMAGE} emurgo/yoroi-mobile:src-at-latest
```

## Actually build the APKs

Execute from git repo root:

```
docker build -t emurgo/yoroi-mobile .
```

## Copy APK from resulting image

```
docker cp $(docker create emurgo/yoroi-mobile:latest):/src/android/app/build/outputs/apk/main/debug/app-main-debug.apk .
```
