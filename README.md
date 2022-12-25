# Lena's Christmas Gift

For a Secret Santa done within my family, the unofficial theme was 
"handmade" so I created a short game that gives back a gift card at the end.

My secret santa recipient was Lena, and the gift card at the end is 
encrypted with a password stored in her gift card. By now, she should 
have also redeemed said gift card, so there is no way for it to be stolen at this point :)

## Usage

The game is (most likely) hosted at http://lena.goldbao.xyz/

If not, try http://blog.ryanbau.com/LenasChristmasGift

And if it still doesn't work, download the repo and use python `http.server`
within the docs/ folder and navigate to index.html to play.

## Build

1. Rename docs/ to dist/

To quickly host the game through Github Pages, I renamed dist to docs to 
host it, rather than trying to move the contents of dist out into the root directory.

2. npm install
3. npx webpack (if you make any changes to the code)
4. Host some basic http server at the dist/ directory. Like python `http.server`

## Dependencies

PhaseJS
CryptoJS

Development:
NPM - webpack babel
Tiled Editor

## Credits

I used game assets that I found online, where the assets were 
free and allowed to reuse and download. 
Credits for those game assets are (most likely) stored within 
the docs/assets/ folder where the assets themselves are stored.
