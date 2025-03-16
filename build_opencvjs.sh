base_dir=${HOME}/workspace
emsdk_dir=${base_dir}/emsdk  # 3.1.74
opencv_dir=${base_dir}/opencv  # 4.11.0
build_py=${opencv_dir}/platforms/js/build_js.py
build_dir=${opencv_dir}/build_wasm
options="\
  --build_wasm \
  --cmake_option="-DBUILD_ZLIB=OFF" \
  --cmake_option="-DBUILD_opencv_calib3d=OFF" \
  --cmake_option="-DBUILD_opencv_dnn=OFF" \
  --cmake_option="-DBUILD_opencv_features2d=OFF" \
  --cmake_option="-DBUILD_opencv_flann=OFF" \
  --cmake_option="-DBUILD_opencv_photo=ON" \
  --cmake_option="-DBUILD_EXAMPLES=OFF" \
  --config opencv_js.config_min.py \
  --disable_single_file \
  --opencv_dir ${opencv_dir} \
  --emscripten_dir ${emsdk_dir}/upstream/emscripten"

source ${emsdk_dir}/emsdk_env.sh

rm -rf ${build_dir}/bin/*
python ${build_py} ${build_dir} $options
cp ${opencv_dir}/build_wasm/bin/* src/opencv/wasm/

rm -rf ${build_dir}/bin/*
python ${build_py} ${build_dir} $options --simd
cp ${opencv_dir}/build_wasm/bin/* src/opencv/simd/

rm -rf ${build_dir}/bin/*
python ${build_py} ${build_dir} $options --threads
cp ${opencv_dir}/build_wasm/bin/* src/opencv/threads/

rm -rf ${build_dir}/bin/*
python ${build_py} ${build_dir} $options --simd --threads
cp ${opencv_dir}/build_wasm/bin/* src/opencv/threaded-simd/
