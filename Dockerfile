FROM circleci/node:10.9 AS rust-env-setup
COPY --from=emurgo/yoroi-mobile:src-at-latest /src /src
WORKDIR /src

# this copy invalidates build cache in case setup function changed
COPY ./docker-assets/bin/rust-setup.functions /src/docker-assets/bin/rust-setup.functions
RUN /bin/bash -c 'source docker-assets/bin/rust-setup.functions && \
    rust-setup'

FROM rust-env-setup AS yoroi-env-setup

# this copy invalidates build cache in case setup function changed
COPY ./docker-assets/bin/yoroi-setup.functions /src/docker-assets/bin/yoroi-setup.functions
RUN /bin/bash -c 'source docker-assets/bin/yoroi-setup.functions && \
    yoroi-setup'

#FROM circleci/android:api-27-node8-alpha AS android-sdk
FROM quay.io/bitriseio/android:latest AS android-sdk
WORKDIR /src

COPY ./docker-assets/bin/rust-setup.functions /src/docker-assets/bin/rust-setup.functions
RUN /bin/bash -c 'source docker-assets/bin/rust-setup.functions && \
    rust-setup'

COPY ./docker-assets/bin/android-setup.functions /src/docker-assets/bin/android-setup.functions
COPY ./android/get_android_ndk.sh /src/android/get_android_ndk.sh
RUN /bin/bash -c 'source docker-assets/bin/android-setup.functions && \
    android-setup'

FROM android-sdk as output
ENV ANDROID_HOME=/opt/android-sdk-linux
ENV ANDROID_NDK_HOME=${ANDROID_HOME}/ndk-bundle
ENV YOROI_ANDROID_BUILD=true
ENV GRADLE_BUILD_FILE_PATH=android/build.gradle

COPY --from=yoroi-env-setup /src /src
WORKDIR /src

COPY ./docker-assets/bin/gradlew-setup.functions /src/docker-assets/bin/gradlew-setup.functions
RUN /bin/bash -c 'source docker-assets/bin/gradlew-setup.functions && \
    gradlew-setup'

COPY ./docker-assets/bin/gradlew-build.functions /src/docker-assets/bin/gradlew-build.functions
RUN /bin/bash -c 'source docker-assets/bin/gradlew-build.functions && \
    gradlew-app-assembleMainDebug'
