def test_increase_enemies():
    enemies = 1
    def increase_enemies():
        nonlocal enemies
        enemies = 2
        print(f"enemies inside function: {enemies}")

    increase_enemies()
    assert enemies == 2
