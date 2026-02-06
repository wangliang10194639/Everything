import 'package:flutter/material.dart';
import 'package:gomoku_puzzle/models/board.dart';

class BoardWidget extends StatelessWidget {
  final Board board;
  final Function(int row, int col) onTap;
  final int? hintRow;
  final int? hintCol;

  const BoardWidget({
    super.key,
    required this.board,
    required this.onTap,
    this.hintRow,
    this.hintCol,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final cellSize = (screenWidth - 40) / Board.boardSize;

    return Container(
      margin: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFE8C87A), // 棋盘木色
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: AspectRatio(
        aspectRatio: 1.0,
        child: CustomPaint(
          size: Size(screenWidth - 80, screenWidth - 80),
          painter: BoardPainter(
            board: board,
            cellSize: cellSize,
            hintRow: hintRow,
            hintCol: hintCol,
          ),
        ),
      ),
    );
  }
}

class BoardPainter extends CustomPainter {
  final Board board;
  final double cellSize;
  final int? hintRow;
  final int? hintCol;

  BoardPainter({
    required this.board,
    required this.cellSize,
    this.hintRow,
    this.hintCol,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black87
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    final starPointPaint = Paint()
      ..color = Colors.black87
      ..style = PaintingStyle.fill;

    // 绘制网格线
    for (int i = 0; i < Board.boardSize; i++) {
      // 横线
      canvas.drawLine(
        Offset(cellSize / 2, cellSize / 2 + i * cellSize),
        Offset(size.width - cellSize / 2, cellSize / 2 + i * cellSize),
        paint,
      );
      // 竖线
      canvas.drawLine(
        Offset(cellSize / 2 + i * cellSize, cellSize / 2),
        Offset(cellSize / 2 + i * cellSize, size.height - cellSize / 2),
        paint,
      );
    }

    // 绘制星位 (天元和四个角的星位)
    final starPoints = [
      const Offset(3, 3),
      const Offset(3, 11),
      const Offset(11, 3),
      const Offset(11, 11),
      const Offset(7, 7), // 天元
    ];

    for (final point in starPoints) {
      canvas.drawCircle(
        Offset(cellSize / 2 + point.dx * cellSize,
            cellSize / 2 + point.dy * cellSize),
        4.0,
        starPointPaint,
      );
    }

    // 绘制棋子
    for (int row = 0; row < Board.boardSize; row++) {
      for (int col = 0; col < Board.boardSize; col++) {
        if (board.grid[row][col] != CellState.empty) {
          final center = Offset(
            cellSize / 2 + col * cellSize,
            cellSize / 2 + row * cellSize,
          );
          _drawPiece(canvas, center, board.grid[row][col] == CellState.black);
        }
      }
    }

    // 绘制提示标记
    if (hintRow != null && hintCol != null) {
      final hintCenter = Offset(
        cellSize / 2 + hintCol! * cellSize,
        cellSize / 2 + hintRow! * cellSize,
      );
      _drawHintMarker(canvas, hintCenter);
    }
  }

  void _drawPiece(Canvas canvas, Offset center, bool isBlack) {
    final gradient = RadialGradient(
      center: const Alignment(-0.3, -0.3),
      colors: isBlack
          ? [Colors.grey.shade800, Colors.black]
          : [Colors.white, Colors.grey.shade300],
    );

    final paint = Paint()
      ..shader = gradient.createShader(Rect.fromCircle(center: center, radius: cellSize * 0.45))
      ..style = PaintingStyle.fill;

    canvas.drawCircle(center, cellSize * 0.45, paint);
  }

  void _drawHintMarker(Canvas canvas, Offset center) {
    final paint = Paint()
      ..color = Colors.red.withOpacity(0.8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    // 画一个圆圈标记
    canvas.drawCircle(center, cellSize * 0.3, paint);

    // 画一个小点
    final dotPaint = Paint()
      ..color = Colors.red
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, cellSize * 0.1, dotPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
