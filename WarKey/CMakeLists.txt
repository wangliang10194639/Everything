cmake_minimum_required(VERSION 3.16)
project(WarKey VERSION 1.0.0 LANGUAGES CXX)

# 设置C++标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 设置输出目录
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# 检测目标平台
if(WIN32)
    message(STATUS "目标平台: Windows")
    add_definitions(-DUNICODE -D_UNICODE)
    set(CMAKE_EXE_LINKER_FLAGS "/SUBSYSTEM:WINDOWS")
elseif(UNIX AND NOT APPLE)
    message(STATUS "目标平台: Linux")
    message(STATUS "注意: 这是Windows程序，需要使用MinGW交叉编译或Wine运行")
endif()

# 查找必要的库
find_package(nlohmann_json QUIET)
if(NOT nlohmann_json_FOUND)
    # 如果没有找到，不使用外部JSON库
    message(STATUS "Using built-in JSON parsing (no external dependency)")
endif()

# 包含目录
include_directories(${CMAKE_SOURCE_DIR}/include)
if(nlohmann_json_FOUND)
    include_directories(${nlohmann_json_INCLUDE_DIRS})
endif()

# 源文件
set(SOURCES
    src/main.cpp
    src/KeyMapping.cpp
    src/KeyboardHook.cpp
    src/KeyRemapper.cpp
    src/ConfigManager.cpp
    src/ProcessDetector.cpp
    src/Logger.cpp
    src/UI/MainWindow.cpp
    src/UI/KeyMappingDialog.cpp
)

# 头文件
set(HEADERS
    include/KeyMapping.h
    include/KeyboardHook.h
    include/KeyRemapper.h
    include/ConfigManager.h
    include/ProcessDetector.h
    include/Logger.h
    include/UI/MainWindow.h
    include/UI/KeyMappingDialog.h
    include/Common.h
)

# 创建可执行文件
add_executable(WarKey ${SOURCES} ${HEADERS})

# 链接库
if(WIN32)
    target_link_libraries(WarKey 
        user32
        kernel32
        shell32
        gdi32
        comctl32
    )
endif()

# 如果使用nlohmann_json
if(nlohmann_json_FOUND)
    target_link_libraries(WarKey nlohmann_json::nlohmann_json)
endif()

# 设置编译选项
if(MSVC)
    target_compile_options(WarKey PRIVATE /W4)
else()
    target_compile_options(WarKey PRIVATE -Wall -Wextra -Wpedantic)
endif()

# 复制配置文件到输出目录
file(COPY ${CMAKE_SOURCE_DIR}/configs DESTINATION ${CMAKE_RUNTIME_OUTPUT_DIRECTORY})

# 安装规则
install(TARGETS WarKey
    RUNTIME DESTINATION bin
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
)

install(DIRECTORY configs DESTINATION .)
install(DIRECTORY logs DESTINATION .)