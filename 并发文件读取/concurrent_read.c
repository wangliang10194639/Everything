#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <string.h>
#include <errno.h>

#define BUFFER_SIZE 4096

// 错误处理函数
void handle_error(const char *msg) {
    perror(msg);
    exit(EXIT_FAILURE);
}

// 读取并写入文件的一部分
// fd_src: 源文件描述符
// fd_dest: 目标文件描述符
// offset: 读取偏移量
// size: 读取字节数
void read_write_partial(int fd_src, int fd_dest, off_t offset, size_t size) {
    char buffer[BUFFER_SIZE];
    ssize_t bytes_read, bytes_write;
    
    // 定位到指定偏移量
    if (lseek(fd_src, offset, SEEK_SET) == (off_t)-1) {
        handle_error("lseek src");
    }
    if (lseek(fd_dest, offset, SEEK_SET) == (off_t)-1) {
        handle_error("lseek dest");
    }
    
    size_t remaining = size;
    while (remaining > 0) {
        size_t to_read = remaining < BUFFER_SIZE ? remaining : BUFFER_SIZE;
        bytes_read = read(fd_src, buffer, to_read);
        if (bytes_read == -1) {
            handle_error("read");
        }
        if (bytes_read == 0) {
            break;  // 到达文件末尾
        }
        
        bytes_write = write(fd_dest, buffer, bytes_read);
        if (bytes_write == -1) {
            handle_error("write");
        }
        
        remaining -= bytes_read;
    }
}

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "用法: %s <源文件> <目标文件>\n", argv[0]);
        exit(EXIT_FAILURE);
    }
    
    const char *src_file = argv[1];
    const char *dest_file = argv[2];
    
    // 打开源文件
    int fd_src = open(src_file, O_RDONLY);
    if (fd_src == -1) {
        handle_error("open src");
    }
    
    // 获取源文件大小
    struct stat st;
    if (fstat(fd_src, &st) == -1) {
        handle_error("fstat");
    }
    off_t file_size = st.st_size;
    
    // 创建目标文件
    int fd_dest = open(dest_file, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd_dest == -1) {
        handle_error("open dest");
    }
    
    // 扩展目标文件到与源文件相同大小
    if (ftruncate(fd_dest, file_size) == -1) {
        handle_error("ftruncate");
    }
    
    // 计算父子进程各自的读取范围
    off_t mid_point = file_size / 2;
    size_t parent_size = file_size - mid_point;  // 父进程读取后半部分
    size_t child_size = mid_point;               // 子进程读取前半部分
    
    printf("文件总大小: %ld 字节\n", (long)file_size);
    printf("子进程读取: 0 - %ld 字节\n", (long)child_size);
    printf("父进程读取: %ld - %ld 字节\n", (long)mid_point, (long)file_size);
    
    // 创建管道用于父子进程同步
    int pipefd[2];
    if (pipe(pipefd) == -1) {
        handle_error("pipe");
    }
    
    pid_t pid = fork();
    
    if (pid == -1) {
        handle_error("fork");
    }
    
    if (pid == 0) {
        // 子进程：读取前半部分
        close(pipefd[1]);  // 关闭写端
        
        printf("[子进程] 开始读取前半部分...\n");
        read_write_partial(fd_src, fd_dest, 0, child_size);
        printf("[子进程] 完成读取前半部分\n");
        
        // 通知父进程
        char signal = 'C';
        write(pipefd[0], &signal, 1);
        close(pipefd[0]);
        
        close(fd_src);
        close(fd_dest);
        exit(EXIT_SUCCESS);
        
    } else {
        // 父进程：读取后半部分
        close(pipefd[0]);  // 关闭读端
        
        printf("[父进程] 开始读取后半部分...\n");
        read_write_partial(fd_src, fd_dest, mid_point, parent_size);
        printf("[父进程] 完成读取后半部分\n");
        
        // 等待子进程完成
        char signal;
        read(pipefd[1], &signal, 1);
        close(pipefd[1]);
        
        printf("[父进程] 收到子进程完成信号\n");
        
        // 等待子进程结束
        int status;
        waitpid(pid, &status, 0);
        
        close(fd_src);
        close(fd_dest);
        
        // 验证文件
        printf("\n=== 验证结果 ===\n");
        if (system("diff -q src_file dest_file > /dev/null 2>&1") == 0) {
            printf("文件复制成功！源文件和目标文件内容一致。\n");
        } else {
            printf("警告: 文件可能不一致，请手动检查。\n");
        }
    }
    
    return 0;
}
