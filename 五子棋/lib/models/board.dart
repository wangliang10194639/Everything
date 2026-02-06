import 'package:gomoku_puzzle/models/level.dart';

/// 棋盘模型 - 管理游戏状态
class Board {
  static const int boardSize = 15; // 标准15x15棋盘
  List<List<CellState>> grid;
  List<Move> moveHistory;
  Player? winner;
  bool gameOver;
  int consecutiveFours;

  Board()
      : grid = List.generate(
          boardSize,
          (_) => List.filled(boardSize, CellState.empty),
        ),
        moveHistory = [],
        winner = null,
        gameOver = false,
        consecutiveFours = 0;

  /// 复制棋盘
  Board copy() {
    final newBoard = Board();
    for (int i = 0; i < boardSize; i++) {
      for (int j = 0; j < boardSize; j++) {
        newBoard.grid[i][j] = grid[i][j];
      }
    }
    newBoard.moveHistory = List.from(moveHistory);
    newBoard.winner = winner;
    newBoard.gameOver = gameOver;
    newBoard.consecutiveFours = consecutiveFours;
    return newBoard;
  }

  /// 初始化关卡
  void initializeLevel(Level level) {
    // 清空棋盘
    grid = List.generate(
      boardSize,
      (_) => List.filled(boardSize, CellState.empty),
    );
    moveHistory = [];
    winner = null;
    gameOver = false;
    consecutiveFours = 0;

    // 放置初始棋子
    for (final move in level.initialBoard) {
      grid[move.row][move.col] =
          move.player == Player.black ? CellState.black : CellState.white;
    }
  }

  /// 尝试落子
  bool makeMove(int row, int col, Player player,
      {bool checkForbidden = false}) {
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
      return false;
    }
    if (grid[row][col] != CellState.empty || gameOver) {
      return false;
    }

    // 检查禁手
    if (checkForbidden && isForbiddenMove(row, col, player)) {
      return false;
    }

    final cellState =
        player == Player.black ? CellState.black : CellState.white;
    grid[row][col] = cellState;
    moveHistory.add(Move(row: row, col: col, player: player));

    // 检查胜利
    if (checkWin(row, col, player)) {
      winner = player;
      gameOver = true;
      return true;
    }

    // 检查禁手导致的失败
    if (checkForbidden && player == Player.black) {
      if (isDoubleThree(row, col) || isDoubleFour(row, col) ||
          isOverline(row, col)) {
        winner = Player.white;
        gameOver = true;
        return true;
      }
    }

    return true;
  }

  /// 悔棋
  bool undoMove() {
    if (moveHistory.isEmpty) return false;
    final lastMove = moveHistory.removeLast();
    grid[lastMove.row][lastMove.col] = CellState.empty;
    winner = null;
    gameOver = false;
    return true;
  }

  /// 检查胜利
  bool checkWin(int row, int col, Player player) {
    final directions = [
      [0, 1], // 水平
      [1, 0], // 垂直
      [1, 1], // 主对角线
      [1, -1], // 副对角线
    ];

    final target = player == Player.black ? CellState.black : CellState.white;

    for (final dir in directions) {
      int count = 1;
      int dr = dir[0];
      int dc = dir[1];

      // 正方向计数
      for (int i = 1; i < 5; i++) {
        final r = row + dr * i;
        final c = col + dc * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize &&
            grid[r][c] == target) {
          count++;
        } else {
          break;
        }
      }

      // 反方向计数
      for (int i = 1; i < 5; i++) {
        final r = row - dr * i;
        final c = col - dc * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize &&
            grid[r][c] == target) {
          count++;
        } else {
          break;
        }
      }

      if (count >= 5) {
        // 长连禁手检查
        if (count > 5 && player == Player.black) {
          return false;
        }
        return true;
      }
    }

    return false;
  }

  /// 检查是否在指定位置形成活四
  bool isOpenFour(int row, int col, Player player) {
    final directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    final target = player == Player.black ? CellState.black : CellState.white;

    for (final dir in directions) {
      int dr = dir[0];
      int dc = dir[1];
      int count = 1;
      bool openEnds = true;

      // 正方向
      for (int i = 1; i < 5; i++) {
        final r = row + dr * i;
        final c = col + dc * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
          if (grid[r][c] == target) {
            count++;
          } else if (grid[r][c] == CellState.empty) {
            break;
          } else {
            openEnds = false;
            break;
          }
        } else {
          openEnds = false;
          break;
        }
      }

      // 反方向
      for (int i = 1; i < 5; i++) {
        final r = row - dr * i;
        final c = col - dc * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
          if (grid[r][c] == target) {
            count++;
          } else if (grid[r][c] == CellState.empty) {
            break;
          } else {
            openEnds = false;
            break;
          }
        } else {
          openEnds = false;
          break;
        }
      }

      if (count == 4 && openEnds) {
        return true;
      }
    }

    return false;
  }

  /// 检查是否形成冲四
  bool isFour(int row, int col, Player player) {
    final directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    final target = player == Player.black ? CellState.black : CellState.white;

    for (final dir in directions) {
      int dr = dir[0];
      int dc = dir[1];
      int count = 1;
      int blockedEnds = 0;

      // 正方向
      for (int i = 1; i < 5; i++) {
        final r = row + dr * i;
        final c = col + dc * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
          if (grid[r][c] == target) {
            count++;
          } else if (grid[r][c] == CellState.empty) {
            break;
          } else {
            blockedEnds++;
            break;
          }
        } else {
          blockedEnds++;
          break;
        }
      }

      // 反方向
      for (int i = 1; i < 5; i++) {
        final r = row - dr * i;
        final c = col - dc * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
          if (grid[r][c] == target) {
            count++;
          } else if (grid[r][c] == CellState.empty) {
            break;
          } else {
            blockedEnds++;
            break;
          }
        } else {
          blockedEnds++;
          break;
        }
      }

      if (count == 4 && blockedEnds == 1) {
        return true;
      }
    }

    return false;
  }

  /// 检查是否形成活三
  bool isOpenThree(int row, int col, Player player) {
    final directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    final target = player == Player.black ? CellState.black : CellState.white;

    for (final dir in directions) {
      int dr = dir[0];
      int dc = dir[1];

      // 检查活三模式: 空-子-子-子-空
      bool valid = true;
      bool hasEmptyStart = false;
      bool hasEmptyEnd = false;

      for (int i = -2; i <= 2; i++) {
        final r = row + dr * i;
        final c = col + dc * i;

        if (i == -2) {
          if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
            if (grid[r][c] == CellState.empty) {
              hasEmptyStart = true;
            } else {
              valid = false;
              break;
            }
          } else {
            valid = false;
            break;
          }
        } else if (i == 2) {
          if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
            if (grid[r][c] == CellState.empty) {
              hasEmptyEnd = true;
            } else {
              valid = false;
              break;
            }
          } else {
            valid = false;
            break;
          }
        } else {
          if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
            if (grid[r][c] != target) {
              valid = false;
              break;
            }
          } else {
            valid = false;
            break;
          }
        }
      }

      if (valid && hasEmptyStart && hasEmptyEnd) {
        return true;
      }
    }

    return false;
  }

  /// 检查禁手
  bool isForbiddenMove(int row, int col, Player player) {
    if (player != Player.black) return false;

    // 临时放置棋子检查
    grid[row][col] = CellState.black;
    bool isForbidden =
        isDoubleThree(row, col) || isDoubleFour(row, col) || isOverline(row, col);
    grid[row][col] = CellState.empty;

    return isForbidden;
  }

  /// 检查双三
  bool isDoubleThree(int row, int col) {
    int threeCount = 0;
    final directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (final dir in directions) {
      if (canFormOpenThree(row, col, dir[0], dir[1])) {
        threeCount++;
      }
    }

    return threeCount >= 2;
  }

  bool canFormOpenThree(int row, int col, int dr, int dc) {
    // 检查各种活三的形成模式
    // 需要在当前位置落子后形成活三
    final patterns = [
      // 空-空-子-子-子
      [-2, -1, 0, 1, 2],
      // 空-子-子-子-空
      [-1, 0, 1, 2],
      // 子-子-子-空-空
      [0, 1, 2, 3, 4],
    ];

    for (final pattern in patterns) {
      bool valid = true;
      int count = 0;
      int emptyStart = 0, emptyEnd = 0;

      for (int i = 0; i < 5; i++) {
        final r = row + dr * (pattern[i] + 2); // 调整位置
        final c = col + dc * (pattern[i] + 2);

        if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) {
          valid = false;
          break;
        }
      }

      if (valid) {
        return true;
      }
    }

    return false;
  }

  /// 检查双四
  bool isDoubleFour(int row, int col) {
    int fourCount = 0;
    final directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (final dir in directions) {
      if (canFormFour(row, col, dir[0], dir[1])) {
        fourCount++;
      }
    }

    return fourCount >= 2;
  }

  bool canFormFour(int row, int col, int dr, int dc) {
    // 检查当前位置落子后能否形成四连
    final target = CellState.black;

    // 正方向计数
    int forward = 0;
    for (int i = 1; i < 5; i++) {
      final r = row + dr * i;
      final c = col + dc * i;
      if (r >= 0 && r < boardSize && c >= 0 && c < boardSize &&
          grid[r][c] == target) {
        forward++;
      } else {
        break;
      }
    }

    // 反方向计数
    int backward = 0;
    for (int i = 1; i < 5; i++) {
      final r = row - dr * i;
      final c = col - dc * i;
      if (r >= 0 && r < boardSize && c >= 0 && c < boardSize &&
          grid[r][c] == target) {
        backward++;
      } else {
        break;
      }
    }

    return (forward + backward) >= 3;
  }

  /// 检查长连
  bool isOverline(int row, int col) {
    final directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    final target = CellState.black;

    for (final dir in directions) {
      int dr = dir[0];
      int dc = dir[1];
      int count = 1;

      // 正方向计数
      for (int i = 1; i < 6; i++) {
        final r = row + dr * i;
        final c = col + dc * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize &&
            grid[r][c] == target) {
          count++;
        } else {
          break;
        }
      }

      // 反方向计数
      for (int i = 1; i < 6; i++) {
        final r = row - dr * i;
        final c = col - dc * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize &&
            grid[r][c] == target) {
          count++;
        } else {
          break;
        }
      }

      if (count > 5) {
        return true;
      }
    }

    return false;
  }
}

/// 格子状态
enum CellState {
  empty,
  black,
  white,
}

/// 落子记录
class Move {
  final int row;
  final int col;
  final Player player;
  final DateTime? timestamp;

  Move({required this.row, required this.col, required this.player, this.timestamp});
}
