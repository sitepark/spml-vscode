#!/bin/bash

printf "Checkout out git repo...\n\n"
[[ -d lspml ]] || git clone https://github.com/DrWursterich/lspml.git
git -C ./lspml pull

printf "Building...\n\n"
cargo build --manifest-path ./lspml/Cargo.toml --release

printf "Copy binary...\n\n"
cp ./lspml/target/release/lspml ./resources/lspml
