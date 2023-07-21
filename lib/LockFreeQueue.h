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