import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gomoku_puzzle/providers/game_provider.dart';
import 'package:gomoku_puzzle/screens/home_screen.dart';
import 'package:gomoku_puzzle/screens/level_screen.dart';
import 'package:gomoku_puzzle/screens/game_screen.dart';
import 'package:gomoku_puzzle/screens/result_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => GameProvider()),
      ],
      child: const GomokuApp(),
    ),
  );
}

class GomokuApp extends StatelessWidget {
  const GomokuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '五子棋闯关',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        fontFamily: 'PingFang SC',
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const HomeScreen(),
        '/levels': (context) => const LevelScreen(),
        '/game': (context) => const GameScreen(),
        '/result': (context) => const ResultScreen(),
      },
    );
  }
}
