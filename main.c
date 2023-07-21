#include <stdio.h>
#include <stdlib.h>
#include <stdatomic.h>
#define QUEUE_SIZE 100
typedef struct
{
    int data[QUEUE_SIZE];
    atomic_int head;
    atomic_int tail;
} LockFreeQueue;

void enqueue(LockFreeQueue *queue, int item)
{
    int tail = atomic_load(&queue->tail);
    int nextTail = (tail + 1) % QUEUE_SIZE;
    if (nextTail != atomic_load(&queue->head))
    {
        queue->data[tail] = item;
        atomic_store(&queue->tail, nextTail);
    }
    else
    {
        printf("Queue is full. Unable to enqueue item %d\n", item);
    }
}

int dequeue(LockFreeQueue *queue)
{
    int head = atomic_load(&queue->head);
    if (head != atomic_load(&queue->tail))
    {
        int item = queue->data[head];
        atomic_store(&queue->head, (head + 1) % QUEUE_SIZE);
        return item;
    }
    else
    {
        printf("Queue is empty. Unable to dequeue item.\n");
        return -1; // or any other value to indicate failure
    }
}
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
