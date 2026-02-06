import 'package:gomoku_puzzle/models/level.dart';

/// 关卡数据 - 包含所有闯关关卡
class LevelData {
  /// 所有关卡列表
  static final List<Level> levels = [
    // ========== 基础篇 ==========
    
    // 第1关 - 初识五子
    Level(
      id: 1,
      title: '第一步',
      description:
          '恭喜你踏入五子棋的世界！这是一道入门题，只需一步即可获胜。找到那个关键的落子点！',
      chapter: 1,
      difficulty: Difficulty.beginner,
      initialBoard: [
        LevelMove(row: 7, col: 6, player: Player.black),
        LevelMove(row: 7, col: 8, player: Player.black),
        LevelMove(row: 6, col: 7, player: Player.black),
        LevelMove(row: 8, col: 7, player: Player.black),
      ],
      playerColor: Player.black,
      maxMoves: 1,
      useForbiddenMoves: false,
      hints: [
        Hint(
          description: '观察现有的四颗黑棋，它们已经形成了一个"十字"形状。',
          hintMoves: [LevelMove(row: 7, col: 7, player: Player.black)],
        ),
      ],
    ),

    // 第2关 - 横线连接
    Level(
      id: 2,
      title: '横连竖通',
      description: '黑棋已经摆好了阵型，只差一颗棋子就能连成五子。找出最直接的五连路径！',
      chapter: 1,
      difficulty: Difficulty.beginner,
      initialBoard: [
        LevelMove(row: 7, col: 3, player: Player.black),
        LevelMove(row: 7, col: 4, player: Player.black),
        LevelMove(row: 7, col: 5, player: Player.black),
        LevelMove(row: 7, col: 7, player: Player.black),
      ],
      playerColor: Player.black,
      maxMoves: 1,
      useForbiddenMoves: false,
      hints: [
        Hint(
          description: '在第7行，棋子的位置分别是第3、4、5和第7列。',
          hintMoves: [LevelMove(row: 7, col: 6, player: Player.black)],
        ),
      ],
    ),

    // 第3关 - 斜线追击
    Level(
      id: 3,
      title: '斜线追击',
      description: '斜向连线也是获胜的重要方式。观察斜线方向，找到连接三子的最佳位置！',
      chapter: 1,
      difficulty: Difficulty.beginner,
      initialBoard: [
        LevelMove(row: 3, col: 3, player: Player.black),
        LevelMove(row: 5, col: 5, player: Player.black),
        LevelMove(row: 6, col: 6, player: Player.black),
      ],
      playerColor: Player.black,
      maxMoves: 1,
      useForbiddenMoves: false,
      hints: [
        Hint(
          description: '从左上到右下的方向，三颗棋子在(3,3)、(5,5)、(6,6)。',
          hintMoves: [LevelMove(row: 4, col: 4, player: Player.black)],
        ),
      ],
    ),

    // 第4关 - 活三初探
    Level(
      id: 4,
      title: '活三布局',
      description:
          '活三是指两端都没有被堵住的三连棋，是进攻的基础。这步棋将形成活三，为下一步冲四做准备。',
      chapter: 1,
      difficulty: Difficulty.easy,
      initialBoard: [
        LevelMove(row: 7, col: 5, player: Player.black),
        LevelMove(row: 7, col: 6, player: Player.black),
        LevelMove(row: 6, col: 6, player: Player.black),
      ],
      playerColor: Player.black,
      maxMoves: 1,
      useForbiddenMoves: false,
      hints: [
        Hint(
          description: '在(7,7)落子，将与(7,6)和(6,6)形成活三。',
          hintMoves: [LevelMove(row: 7, col: 7, player: Player.black)],
        ),
      ],
    ),

    // 第5关 - 冲四威胁
    Level(
      id: 5,
      title: '冲四致胜',
      description:
          '冲四是指四连棋，一端被堵住但另一端开放。对手必须立即防守，否则下一步就是五连。',
      chapter: 1,
      difficulty: Difficulty.easy,
      initialBoard: [
        LevelMove(row: 5, col: 3, player: Player.black),
        LevelMove(row: 5, col: 4, player: Player.black),
        LevelMove(row: 5, col: 5, player: Player.black),
      ],
      playerColor: Player.black,
      maxMoves: 1,
      useForbiddenMoves: false,
      hints: [
        Hint(
          description: '在(5,6)落子形成冲四，对手只能防守一侧。',
          hintMoves: [LevelMove(row: 5, col: 6, player: Player.black)],
        ),
      ],
    ),

    // 第6关 - 阻断与连接
    Level(
      id: 6,
      title: '攻防兼备',
      description:
          '有时一步棋既能连接自己的棋子，又能阻断对手。这步棋至关重要！',
      chapter: 1,
      difficulty: Difficulty.easy,
      initialBoard: [
        LevelMove(row: 6, col: 6, player: Player.black),
        LevelMove(row: 7, col: 7, player: Player.black),
        LevelMove(row: 8, col: 8, player: Player.white),
        LevelMove(row: 7, col: 9, player: Player.white),
        LevelMove(row: 6, col: 10, player: Player.white),
      ],
      playerColor: Player.black,
      maxMoves: 1,
      useForbiddenMoves: false,
      hints: [
        Hint(
          description: '白棋在斜线上已形成三连，需要在(8,8)落子阻断并连接黑棋。',
          hintMoves: [LevelMove(row: 8, col: 8, player: Player.black)],
        ),
      ],
    ),

    // 第7关 - VCF初学
    Level(
      id: 7,
      title: 'VCF入门',
      description:
          'VCF（连续冲四胜）是高级战术，通过连续走出冲四来迫使对手无法防守。第一步是关键！',
      chapter: 1,
      difficulty: Difficulty.medium,
      initialBoard: [
        LevelMove(row: 7, col: 5, player: Player.black),
        LevelMove(row: 7, col: 6, player: Player.black),
        LevelMove(row: 6, col: 6, player: Player.black),
        LevelMove(row: 5, col: 6, player: Player.white),
      ],
      playerColor: Player.black,
      maxMoves: 3,
      useForbiddenMoves: false,
      hints: [
        Hint(
          description: '第一步在(8,6)落子形成冲四，逼迫白棋防守。',
          hintMoves: [
            LevelMove(row: 8, col: 6, player: Player.black),
          ],
        ),
        Hint(
          description: '白棋只能防守(8,6)，然后在(5,7)继续冲四。',
          hintMoves: [
            LevelMove(row: 8, col: 6, player: Player.black),
            LevelMove(row: 5, col: 7, player: Player.black),
          ],
        ),
      ],
    ),

    // ========== 进阶篇 ==========

    // 第8关 - 双三陷阱
    Level(
      id: 8,
      title: '双三制胜',
      description:
          '双三是指一步棋同时形成两个活三。这是强大的进攻手段，因为对手无法同时阻断两个活三。',
      chapter: 2,
      difficulty: Difficulty.medium,
      initialBoard: [
        LevelMove(row: 6, col: 4, player: Player.black),
        LevelMove(row: 6, col: 5, player: Player.black),
        LevelMove(row: 7, col: 6, player: Player.black),
        LevelMove(row: 8, col: 7, player: Player.black),
        LevelMove(row: 4, col: 6, player: Player.white),
      ],
      playerColor: Player.black,
      maxMoves: 1,
      useForbiddenMoves: true,
      hints: [
        Hint(
          description: '在(6,6)落子，可以同时形成两个方向的活三。',
          hintMoves: [LevelMove(row: 6, col: 6, player: Player.black)],
        ),
      ],
    ),

    // 第9关 - 活四技巧
    Level(
      id: 9,
      title: '活四必胜',
      description:
          '活四是指两端都开放的四连棋。只要形成活四，下一步必然获胜。找到关键的一手棋！',
      chapter: 2,
      difficulty: Difficulty.medium,
      initialBoard: [
        LevelMove(row: 7, col: 4, player: Player.black),
        LevelMove(row: 7, col: 5, player: Player.black),
        LevelMove(row: 7, col: 6, player: Player.black),
        LevelMove(row: 5, col: 6, player: Player.white),
        LevelMove(row: 6, col: 6, player: Player.white),
      ],
      playerColor: Player.black,
      maxMoves: 1,
      useForbiddenMoves: false,
      hints: [
        Hint(
          description: '在(7,3)落子，将与(7,4)、(7,5)形成活四。',
          hintMoves: [LevelMove(row: 7, col: 3, player: Player.black)],
        ),
      ],
    ),

    // 第10关 - 假眼陷阱
    Level(
      id: 10,
      title: '识破假眼',
      description:
          '假眼是指看起来像活三或活四，但实际上不是。这步棋将识破白棋的假眼并建立自己的优势。',
      chapter: 2,
      difficulty: Difficulty.hard,
      initialBoard: [
        LevelMove(row: 5, col: 4, player: Player.white),
        LevelMove(row: 6, col: 5, player: Player.white),
        LevelMove(row: 7, col: 6, player: Player.white),
        LevelMove(row: 8, col: 7, player: Player.black),
        LevelMove(row: 9, col: 8, player: Player.black),
        LevelMove(row: 10, col: 9, player: Player.black),
      ],
      playerColor: Player.black,
      maxMoves: 1,
      useForbiddenMoves: false,
      hints: [
        Hint(
          description: '白棋的"活三"实际上是假眼，在(6,6)落子破解假眼并连接黑棋。',
          hintMoves: [LevelMove(row: 6, col: 6, player: Player.black)],
        ),
      ],
    ),

    // 第11关 - VCF进阶
    Level(
      id: 11,
      title: '连环冲四',
      description:
          '复杂的VCF战术，需要精确计算每一步。这道题有多步VCF解法，展示连续冲四的威力。',
      chapter: 2,
      difficulty: Difficulty.hard,
      initialBoard: [
        LevelMove(row: 6, col: 4, player: Player.black),
        LevelMove(row: 6, col: 5, player: Player.black),
        LevelMove(row: 5, col: 5, player: Player.black),
        LevelMove(row: 4, col: 5, player: Player.white),
        LevelMove(row: 7, col: 6, player: Player.white),
        LevelMove(row: 8, col: 6, player: Player.white),
      ],
      playerColor: Player.black,
      maxMoves: 5,
      useForbiddenMoves: false,
      hints: [
        Hint(
          description: '第一步在(6,3)落子开始VCF。',
          hintMoves: [
            LevelMove(row: 6, col: 3, player: Player.black),
          ],
        ),
        Hint(
          description: '正确顺序：第一步(6,3)，第二步(5,6)，第三步(4,4)...',
          hintMoves: [
            LevelMove(row: 6, col: 3, player: Player.black),
            LevelMove(row: 5, col: 6, player: Player.black),
            LevelMove(row: 4, col: 4, player: Player.black),
          ],
        ),
      ],
    ),

    // 第12关 - 禁手考验
    Level(
      id: 12,
      title: '禁手规则',
      description:
          '黑棋有禁手规则限制！不能走出双三、双四或长连。这步棋既要获胜，又不能违反禁手。',
      chapter: 2,
      difficulty: Difficulty.expert,
      initialBoard: [
        LevelMove(row: 6, col: 3, player: Player.black),
        LevelMove(row: 6, col: 4, player: Player.black),
        LevelMove(row: 6, col: 5, player: Player.black),
        LevelMove(row: 7, col: 4, player: Player.black),
        LevelMove(row: 5, col: 4, player: Player.white),
      ],
      playerColor: Player.black,
      maxMoves: 1,
      useForbiddenMoves: true,
      hints: [
        Hint(
          description: '直接落子(6,6)会形成双三禁手。正确解法是先在其他位置做杀。',
          hintMoves: [
            // 这是一个复杂的局面，需要特殊处理
          ],
        ),
      ],
    ),
  ];

  /// 获取指定章节的所有关卡
  static List<Level> getLevelsByChapter(int chapter) {
    return levels.where((level) => level.chapter == chapter).toList();
  }

  /// 获取指定关卡
  static Level? getLevel(int id) {
    try {
      return levels.firstWhere((level) => level.id == id);
    } catch (e) {
      return null;
    }
  }

  /// 获取章节列表
  static List<Chapter> getChapters() {
    return [
      Chapter(
        id: 1,
        title: '基础篇',
        description: '掌握基本规则与初级战术',
        levelIds: [1, 2, 3, 4, 5, 6, 7],
        type: ChapterType.basic,
      ),
      Chapter(
        id: 2,
        title: '进阶篇',
        description: '引入复杂战术：双三、活四、假眼陷阱、VCF',
        levelIds: [8, 9, 10, 11, 12],
        type: ChapterType.advanced,
      ),
    ];
  }
}
