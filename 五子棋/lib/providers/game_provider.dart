import 'package:flutter/material.dart';
import 'package:gomoku_puzzle/models/board.dart';
import 'package:gomoku_puzzle/models/level.dart';
import 'package:gomoku_puzzle/data/levels.dart';

/// 游戏状态管理
class GameProvider with ChangeNotifier {
  Board _board = Board();
  Level? _currentLevel;
  int _currentLevelIndex = 0;
  int _movesUsed = 0;
  bool _isHintUsed = false;
  int _undoCount = 0;
  int _maxUndoCount = 3;
  GameState _gameState = GameState.idle;
  String? _hintMessage;

  // Getters
  Board get board => _board;
  Level? get currentLevel => _currentLevel;
  int get currentLevelIndex => _currentLevelIndex;
  int get movesUsed => _movesUsed;
  bool get isHintUsed => _hintUsed;
  int get undoCount => _undoCount;
  int get remainingUndos => _maxUndoCount - _undoCount;
  GameState get gameState => _gameState;
  String? get hintMessage => _hintMessage;

  /// 开始指定关卡
  void startLevel(int levelId) {
    final level = LevelData.getLevel(levelId);
    if (level == null) return;

    _currentLevel = level;
    _board.initializeLevel(level);
    _movesUsed = 0;
    _isHintUsed = false;
    _undoCount = 0;
    _gameState = GameState.playing;
    _hintMessage = null;

    notifyListeners();
  }

  /// 开始下一关
  void nextLevel() {
    if (_currentLevel == null) return;

    final nextLevelId = _currentLevel!.id + 1;
    final nextLevel = LevelData.getLevel(nextLevelId);

    if (nextLevel != null) {
      startLevel(nextLevelId);
    } else {
      _gameState = GameState.allCompleted;
      notifyListeners();
    }
  }

  /// 落子
  bool makeMove(int row, int col) {
    if (_gameState != GameState.playing || _currentLevel == null) {
      return false;
    }

    final success = _board.makeMove(
      row,
      col,
      _currentLevel!.playerColor,
      checkForbidden: _currentLevel!.useForbiddenMoves,
    );

    if (success) {
      _movesUsed++;

      // 检查胜利
      if (_board.winner != null) {
        if (_board.winner == _currentLevel!.playerColor) {
          _gameState = GameState.won;
        } else {
          _gameState = GameState.lost;
        }
      }
      // 检查步数限制
      else if (_movesUsed > _currentLevel!.maxMoves) {
        _gameState = GameState.lost;
      }

      notifyListeners();
    }

    return success;
  }

  /// 悔棋
  bool undoMove() {
    if (_gameState != GameState.playing || _undoCount >= _maxUndoCount) {
      return false;
    }

    if (_board.undoMove()) {
      _undoCount++;
      _movesUsed = max(0, _movesUsed - 1);
      notifyListeners();
      return true;
    }

    return false;
  }

  /// 使用提示
  Hint? useHint() {
    if (_gameState != GameState.playing || _currentLevel == null) {
      return null;
    }

    if (_isHintUsed) {
      _hintMessage = '本关卡提示已使用';
      notifyListeners();
      return null;
    }

    _isHintUsed = true;
    _hintMessage = '提示：${_currentLevel!.hints[0].description}';
    notifyListeners();

    return _currentLevel!.hints.isNotEmpty ? _currentLevel!.hints[0] : null;
  }

  /// 获取提示落子位置
  LevelMove? getHintMove() {
    if (_currentLevel == null || _currentLevel!.hints.isEmpty) {
      return null;
    }

    return _currentLevel!.hints[0].hintMoves.isNotEmpty
        ? _currentLevel!.hints[0].hintMoves[0]
        : null;
  }

  /// 重置当前关卡
  void resetLevel() {
    if (_currentLevel == null) return;
    startLevel(_currentLevel!.id);
  }

  /// 获取关卡进度
  Map<String, dynamic> getLevelProgress(int levelId) {
    // 这里可以集成本地存储来保存进度
    return {
      'levelId': levelId,
      'completed': false,
      'stars': 0,
    };
  }

  /// 保存关卡完成状态
  void saveLevelComplete(int levelId, int stars) {
    // 集成 SharedPreferences 保存进度
  }
}

/// 游戏状态枚举
enum GameState {
  idle, // 空闲
  playing, // 进行中
  won, // 获胜
  lost, // 失败
  allCompleted, // 全部通关
}
