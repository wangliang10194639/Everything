CC = gcc
CFLAGS = -Wall -O2
TARGET = concurrent_read
SRC = concurrent_read.c

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) -o $(TARGET) $(SRC)

clean:
	rm -f $(TARGET) test.txt output.txt

test: $(TARGET)
	@echo "创建测试文件..."
	@echo "这是一个用于测试并发文件读取的程序。" > test.txt
	@echo "文件将被分成两部分，由父子进程分别读取。" >> test.txt
	@echo "第一行由子进程读取。" >> test.txt
	@echo "第二行由父进程读取。" >> test.txt
	@echo "第三行也由父进程读取。" >> test.txt
	@echo "测试完成！" >> test.txt
	@echo ""
	@echo "运行程序..."
	./$(TARGET) test.txt output.txt
	@echo ""
	@echo "比较文件..."
	@echo "源文件内容:"
	@cat test.txt
	@echo ""
	@echo "目标文件内容:"
	@cat output.txt
	@echo ""
	@echo "diff结果:"
	@diff test.txt output.txt && echo "文件完全一致！"

.PHONY: all clean test
