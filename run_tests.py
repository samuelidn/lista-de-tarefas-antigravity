"""
Script utilitário para executar os testes automatizados ou abrir o painel de testes no navegador.
"""
import webbrowser
from pathlib import Path

test_file = Path(__file__).parent / "testes.html"

print("=" * 60)
print("Abrindo painel visual de testes no navegador...")
print(f"Arquivo: {test_file}")
print("=" * 60)

webbrowser.open(test_file.as_uri())
