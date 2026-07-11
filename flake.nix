{
  description = "Environnements de dev: React/Vue.js, Python, Java";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells = {
          # ---------------------------------------------------------------
          # React / Vue.js (Node.js + gestionnaires de paquets + outils front)
          # ---------------------------------------------------------------
          web = pkgs.mkShell {
            name = "web-react-vue";
            buildInputs = with pkgs; [
              nodejs_22
              pnpm
              yarn
              typescript
              typescript-language-server
              vscode-langservers-extracted
            ];
            shellHook = ''
              echo "🌐 Shell web (React/Vue) — node $(node --version)"
            '';
          };

          # ---------------------------------------------------------------
          # Python
          # ---------------------------------------------------------------
          python = pkgs.mkShell {
            name = "python-dev";
            buildInputs = with pkgs; [
              (python312.withPackages (ps: with ps; [
                pip
                virtualenv
                black
                ruff
                pytest
                ipython
              ]))
              pyright
            ];
            shellHook = ''
              echo "🐍 Shell Python — $(python --version)"
              if [ ! -d .venv ]; then
                python -m venv .venv
              fi
              source .venv/bin/activate
            '';
          };

          # ---------------------------------------------------------------
          # Java
          # ---------------------------------------------------------------
          java = pkgs.mkShell {
            name = "java-dev";
            buildInputs = with pkgs; [
              jdk21
              maven
              gradle
            ];
            JAVA_HOME = "${pkgs.jdk21}/lib/openjdk";
            shellHook = ''
              echo "☕ Shell Java — $(java --version | head -n1)"
            '';
          };

          # ---------------------------------------------------------------
          # Shell par défaut: un peu de tout, pratique pour un dépôt mixte
          # ---------------------------------------------------------------
          default = pkgs.mkShell {
            name = "fullstack-dev";
            buildInputs = with pkgs; [
              nodejs_22
              pnpm
              (python312.withPackages (ps: with ps; [ pip virtualenv black ruff ]))
              jdk21
              maven
            ];
          };
        };
      }
    );
}
