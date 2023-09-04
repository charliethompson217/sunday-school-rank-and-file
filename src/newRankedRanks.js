import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

const RankedRanks = ({ rankedRanks, rankPicks, onRankChange }) => {
    const sketchRef = useRef();
    function keepLastWord(inputString) {
        const words = inputString.split(' ');
        if (words.length > 0) {
            const lastWord = words[words.length - 1];
            return lastWord;
        }
        return inputString;
    }
    useEffect(() => {
        const sketch = (p) => {
            let rankedOptions = rankedRanks;
            let canvas;
            const canvasWidth = 300;
            const canvasHeight = rankedOptions.length*55+5;
            let x;
            let y;
            let holding = false;
            let itemHeld = -1;
            let draggedOverItem = -1;
            let games = [];
            p.setup = () => {
                canvas = p.createCanvas(canvasWidth, canvasHeight);
                canvas.parent(sketchRef.current);
                canvas.touchMoved(disableScroll);
                rankedOptions.map((option, index) => {
                    const title = `${rankPicks[option - 1].value} (vs ${keepLastWord(rankPicks[option - 1].game.find((team) => team !== rankPicks[option - 1].value))})`;
                    const gameCode = option;
                    let game = new RankOption(title, index, gameCode);
                    games.push(game);
                    return game;
                });
            };
            
            const disableScroll = (event) => {
                event.preventDefault();
            };
            p.touchStarted = () =>{
                dragStarted();
            };
            p.touchMoved = () =>{
                dragingOver();
            };
            p.touchEnded = () =>{
                dragStoped();
            };
            p.mousePressed = () => {
                dragStarted();
            };
            p.mouseDragged = () => {
                dragingOver();
            };
            p.mouseReleased = () => {
                dragStoped();
            };

            p.draw = () => {
                p.background(220, 187, 160);
                for(let i=0; i<games.length; i++){
                    games[i].update();
                }
                if (holding&&itemHeld!==-1){
                    games[itemHeld].update();
                }
            };

            const dragStarted = () => {
                x = Math.floor(p.mouseX);
                y = Math.floor(p.mouseY);
                if(x<0||y<0||x>canvasWidth||y>canvasHeight){
                    return;
                }
                holding = true;
                let item = Math.floor((y-5)/55);
                itemHeld=item;
                if(item<0){
                    item=0;
                }
                if(item>=games.length){
                    item=games.length-1;
                }
                games[item].startDrag();
                
            };
            const dragingOver = () => {
                if(holding){
                    y = Math.floor(p.mouseY);
                    if(y<0||y>canvasHeight){
                        return;
                    }
                    let overItem = Math.floor((y-5)/55);
                    if(overItem<0){
                        overItem=0;
                    }
                    if (itemHeld !== overItem && draggedOverItem !== -1) {
                        const oldHoldIndex = itemHeld;
                        const oldOverIndex = overItem;
                        games[overItem].index = oldHoldIndex;
                        games[itemHeld].index = oldOverIndex;
                        const temp = games[itemHeld];
                        games[itemHeld] = games[overItem];
                        games[overItem] = temp;
                        itemHeld = overItem;
                    }
                    draggedOverItem=overItem;
                }
            };
            const dragStoped = () => {
                holding = false;
                if(itemHeld!==-1){
                    games[itemHeld].endDrag();
                    itemHeld=-1;
                }
                draggedOverItem=-1;
                const integerArray = games.map((game) => game.gameCode);
                onRankChange(integerArray);
            };

            class RankOption {
                constructor(words, index, gameCode){
                    this.gameCode = gameCode;
                    this.index = index;
                    this.words = words;
                    this.x=25;
                    this.r = 255;
                    this.g = 255;
                    this.b = 255;
                    this.dragging = false;
                };
                update(){
                    if(this.dragging){
                        this.y=y-this.offset;
                    }
                    else {
                        this.y=(this.index+1)*55;
                    }
                    p.fill(this.r, this.g, this.b);
                    p.noStroke();
                    p.rect(this.x, this.y-50, 250, 50);
                    p.ellipse(this.x, this.y-25, 50, 50);
                    p.ellipse(this.x+250, this.y-25, 50, 50);
                    p.fill(17, 81, 255);
                    var w = p.textWidth(rankedOptions.length - this.index);
                    p.rect(this.x-10, this.y-40, w+10, 30);
                    p.fill(0, 0, 0);
                    p.textSize(15);
                    p.text(this.words, this.x+10+w, this.y-20);
                    p.fill(255, 255, 255);
                    p.text(rankedOptions.length - this.index, this.x-5, this.y-20);
                }
                startDrag(){
                    this.r = 50;
                    this.g = 50;
                    this.b = 200;
                    this.dragging = true;
                    this.offset=y-this.y;
                }
                endDrag(){
                    this.r = 255;
                    this.g = 255;
                    this.b = 255;
                    this.dragging = false;
                }
            }

        };

        const myP5 = new p5(sketch);

        return () => {
            myP5.remove();
        };
    }, [rankPicks, rankedRanks, onRankChange]);

    return (
        <>
        <h3>Rank Ordering</h3>
        <p>
            Now, you will rank your selected Rank winners. Rank your highest points at top and lowest points at bottom. The rank number next to each team is how many points you will earn if that team wins. This also means that your five picks closest from the bottom (picks 1 through 5) will be the teams that must win in order for you to earn the weekly bonus.
        </p>
        <div id="sketch-container" ref={sketchRef} style={{ display: 'flex', justifyContent: 'left' }}></div>
        </>
    );
};

export default RankedRanks;