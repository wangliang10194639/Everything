/// 关卡模型 - 定义单个关卡的结构
class Level {
  final int id;
  final String title;
  final String description;
  final int chapter;
  final Difficulty difficulty;
  final List<LevelMove> initialBoard;
  final Player playerColor;
  final int maxMoves;
  final bool useForbiddenMoves;
  final List<Hint> hints;

  Level({
    required this.id,
    required this.title,
    required this.description,
    required this.chapter,
    required this.difficulty,
    required this.initialBoard,
    required this.playerColor,
    required this.maxMoves,
    this.useForbiddenMoves = false,
    required this.hints,
  });

  /// 从JSON加载关卡
  factory Level.fromJson(Map<String, dynamic> json) {
    return Level(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      chapter: json['chapter'],
      difficulty: Difficulty.values[json['difficulty']],
      initialBoard: (json['initialBoard'] as List)
          .map((e) => LevelMove.fromJson(e))
          .toList(),
      playerColor: Player.values[json['playerColor']],
      maxMoves: json['maxMoves'],
      useForbiddenMoves: json['useForbiddenMoves'] ?? false,
      hints:
          (json['hints'] as List).map((e) => Hint.fromJson(e)).toList(),
    );
  }

  /// 转换为JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'chapter': chapter,
      'difficulty': difficulty.index,
      'initialBoard': initialBoard.map((e) => e.toJson()).toList(),
      'playerColor': playerColor.index,
      'maxMoves': maxMoves,
      'useForbiddenMoves': useForbiddenMoves,
      'hints': hints.map((e) => e.toJson()).toList(),
    };
  }
}

/// 难度枚举
enum Difficulty {
  beginner, // 入门
  easy, // 简单
  medium, // 中等
  hard, // 困难
  expert, // 专家
}

/// 玩家颜色
enum Player {
  black,
  white,
}

/// 关卡中的初始棋子位置
class LevelMove {
  final int row;
  final int col;
  final Player player;

  LevelMove({required this.row, required this.col, required this.player});

  factory LevelMove.fromJson(Map<String, dynamic> json) {
    return LevelMove(
      row: json['row'],
      col: json['col'],
      player: Player.values[json['player']],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'row': row,
      'col': col,
      'player': player.index,
    };
  }
}

/// 提示信息
class Hint {
  final String description;
  final List<LevelMove> hintMoves;

  Hint({required this.description, required this.hintMoves});

  factory Hint.fromJson(Map<String, dynamic> json) {
    return Hint(
      description: json['description'],
      hintMoves: (json['hintMoves'] as List)
          .map((e) => LevelMove.fromJson(e))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'description': description,
      'hintMoves': hintMoves.map((e) => e.toJson()).toList(),
    };
  }
}

/// 章节模型
class Chapter {
  final int id;
  final String title;
  final String description;
  final List<int> levelIds;
  final ChapterType type;

  Chapter({
    required this.id,
    required this.title,
    required this.description,
    required this.levelIds,
    required this.type,
  });
}

/// 章节类型
enum ChapterType {
  basic, // 基础篇
  advanced, // 进阶篇
}
