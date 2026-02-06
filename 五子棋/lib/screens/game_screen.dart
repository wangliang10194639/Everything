import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gomoku_puzzle/providers/game_provider.dart';
import 'package:gomoku_puzzle/data/levels.dart';
import 'package:gomoku_puzzle/widgets/board_widget.dart';

class GameScreen extends StatefulWidget {
  const GameScreen({super.key});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final levelId = ModalRoute.of(context)!.settings.arguments as int;
      context.read<GameProvider>().startLevel(levelId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final gameProvider = context.watch<GameProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(gameProvider.currentLevel?.title ?? '五子棋'),
        centerTitle: true,
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('确认重置'),
                  content: const Text('确定要重置当前关卡吗？'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('取消'),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pop(context);
                        gameProvider.resetLevel();
                      },
                      child: const Text('确定'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // 关卡信息栏
          _buildInfoBar(gameProvider),
          // 提示信息
          if (gameProvider.hintMessage != null)
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.amber.shade100,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber.shade300),
              ),
              child: Row(
                children: [
                  const Icon(Icons.lightbulb, color: Colors.amber),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      gameProvider.hintMessage!,
                      style: const TextStyle(fontSize: 14),
                    ),
                  ),
                ],
              ),
            ),
          // 棋盘区域
          Expanded(
            child: Center(
              child: BoardWidget(
                board: gameProvider.board,
                onTap: (row, col) {
                  gameProvider.makeMove(row, col);
                  _checkGameEnd(context, gameProvider);
                },
              ),
            ),
          ),
          // 操作按钮栏
          _buildActionBar(gameProvider),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildInfoBar(GameProvider gameProvider) {
    final level = gameProvider.currentLevel;
    if (level == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '第 ${level.id} 关',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: _getDifficultyColor(level.difficulty),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          _getDifficultyName(level.difficulty),
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '执${level.playerColor == Player.black ? '黑' : '白'}',
                        style: TextStyle(
                          fontSize: 14,
                          color: level.playerColor == Player.black
                              ? Colors.black
                              : Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '步数: ${gameProvider.movesUsed} / ${level.maxMoves}',
                    style: TextStyle(
                      fontSize: 16,
                      color: gameProvider.movesUsed > level.maxMoves
                          ? Colors.red
                          : Colors.grey,
                    ),
                  ),
                  if (level.useForbiddenMoves)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.red.shade100,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text(
                        '禁手规则',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.red,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            level.description,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey.shade600,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildActionBar(GameProvider gameProvider) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          // 悔棋按钮
          ElevatedButton.icon(
            onPressed: gameProvider.undoCount >= 3 ||
                    gameProvider.gameState != GameState.playing
                ? null
                : () {
                    gameProvider.undoMove();
                  },
            icon: const Icon(Icons.undo),
            label: Text('悔棋 (${gameProvider.remainingUndos})'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange.shade100,
              foregroundColor: Colors.orange.shade800,
            ),
          ),
          // 提示按钮
          ElevatedButton.icon(
            onPressed: gameProvider.isHintUsed ||
                    gameProvider.gameState != GameState.playing
                ? null
                : () {
                    gameProvider.useHint();
                  },
            icon: const Icon(Icons.lightbulb),
            label: const Text('提示'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber.shade100,
              foregroundColor: Colors.amber.shade800,
            ),
          ),
        ],
      ),
    );
  }

  void _checkGameEnd(BuildContext context, GameProvider gameProvider) {
    if (gameProvider.gameState == GameState.won) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: const Text('🎉 恭喜通关！'),
            content: const Text('你成功完成了这一关！'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                child: const Text('返回关卡'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  gameProvider.nextLevel();
                  if (gameProvider.gameState != GameState.allCompleted) {
                    Navigator.pushNamed(
                      context,
                      '/game',
                      arguments: gameProvider.currentLevel?.id,
                    );
                  } else {
                    showDialog(
                      context: context,
                      barrierDismissible: false,
                      builder: (context) => AlertDialog(
                        title: const Text('🏆 恭喜全部通关！'),
                        content: const Text('你已经完成了所有关卡！'),
                        actions: [
                          TextButton(
                            onPressed: () {
                              Navigator.pop(context);
                              Navigator.pop(context);
                              Navigator.pop(context);
                            },
                            child: const Text('返回首页'),
                          ),
                        ],
                      ),
                    );
                  }
                },
                child: const Text('下一关'),
              ),
            ],
          ),
        );
      });
    } else if (gameProvider.gameState == GameState.lost) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: const Text('💔 挑战失败'),
            content: const Text('不要气馁，再试一次吧！'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                child: const Text('返回关卡'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  gameProvider.resetLevel();
                },
                child: const Text('重新挑战'),
              ),
            ],
          ),
        );
      });
    }
  }

  Color _getDifficultyColor(Difficulty difficulty) {
    switch (difficulty) {
      case Difficulty.beginner:
        return Colors.green;
      case Difficulty.easy:
        return Colors.blue;
      case Difficulty.medium:
        return Colors.orange;
      case Difficulty.hard:
        return Colors.red;
      case Difficulty.expert:
        return Colors.purple;
    }
  }

  String _getDifficultyName(Difficulty difficulty) {
    switch (difficulty) {
      case Difficulty.beginner:
        return '入门';
      case Difficulty.easy:
        return '简单';
      case Difficulty.medium:
        return '中等';
      case Difficulty.hard:
        return '困难';
      case Difficulty.expert:
        return '专家';
    }
  }
}
