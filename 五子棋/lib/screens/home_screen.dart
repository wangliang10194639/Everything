import 'package:flutter/material.dart';
import 'package:gomoku_puzzle/data/levels.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final chapters = LevelData.getChapters();

    return Scaffold(
      appBar: AppBar(
        title: const Text('五子棋闯关'),
        centerTitle: true,
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.blue.shade50,
              Colors.blue.shade100,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: 40),
              // 游戏标题
              const Icon(
                Icons.apps,
                size: 80,
                color: Colors.blue,
              ),
              const SizedBox(height: 20),
              const Text(
                '五子棋闯关',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                '渐进式挑战，提升棋力',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 40),
              // 章节列表
              Expanded(
                child: ListView.builder(
                  itemCount: chapters.length,
                  itemBuilder: (context, index) {
                    final chapter = chapters[index];
                    return _buildChapterCard(context, chapter);
                  },
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChapterCard(BuildContext context, Chapter chapter) {
    final levels = LevelData.getLevelsByChapter(chapter.id);
    final isLocked = chapter.id > 1; // 第一章解锁，其他锁定

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: isLocked
            ? null
            : () {
                Navigator.pushNamed(
                  context,
                  '/levels',
                  arguments: chapter.id,
                );
              },
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: isLocked
                ? null
                : LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.blue.shade400,
                      Colors.blue.shade600,
                    ],
                  ),
            color: isLocked ? Colors.grey.shade300 : null,
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          '第${chapter.id}章',
                          style: TextStyle(
                            fontSize: 14,
                            color: isLocked ? Colors.grey : Colors.white70,
                          ),
                        ),
                        if (chapter.type == ChapterType.basic) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Text(
                              '基础',
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ] else ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.orange.withOpacity(0.8),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Text(
                              '进阶',
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      chapter.title,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: isLocked ? Colors.grey : Colors.white,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      chapter.description,
                      style: TextStyle(
                        fontSize: 14,
                        color: isLocked ? Colors.grey.shade600 : Colors.white70,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      '共 ${levels.length} 关',
                      style: TextStyle(
                        fontSize: 12,
                        color: isLocked ? Colors.grey : Colors.white60,
                      ),
                    ),
                  ],
                ),
              ),
              if (isLocked)
                const Icon(
                  Icons.lock,
                  size: 40,
                  color: Colors.grey,
                )
              else
                const Icon(
                  Icons.arrow_forward_ios,
                  size: 30,
                  color: Colors.white,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
