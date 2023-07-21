#include <stdio.h>
#include <stdlib.h>
#include "lib/LockFreeQueue.h"

int main()
{
    LockFreeQueue queue;
    atomic_init(&queue.head, 0);
    atomic_init(&queue.tail, 0);
    enqueue(&queue, 1);
    enqueue(&queue, 2);
    printf("%d\n", dequeue(&queue)); // 输出 1
    printf("%d\n", dequeue(&queue)); // 输出 2
    printf("%d\n", dequeue(&queue)); // 输出 -1（队列为空）
    return 0;
}
