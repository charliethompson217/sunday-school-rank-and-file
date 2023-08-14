import React from 'react';
import Navbar from './Navbar';
import './App.css';
export default function Rules() {
  return (
    <>
        <Navbar></Navbar>
        <div className='navbar-offset-container'>
            <div className='rules'>
                <h1>2023-2024 Season Rules</h1>
                <h2>Overview</h2>
                <p>
                Hello and welcome to the <span class="italic-text">Sunday School: Rank and File</span> NFL pool! This pool is now
                going into its second year, complete with minor changes for balance and greater
                enjoyment. For years, I, and many of you, have played in a great pool, and I hope to
                continue that fun.<br></br><br></br>
                This pool is primarily for fun, and participants should share that spirit. Additionally,
                although certain winnings are calculated on a weekly basis, this pool is meant to be a
                season-long activity. Winnings are not awarded until the end of the season, and
                participants are expected to participate every week (that said, late adds will be
                permitted, and participants are not formally forbidden from dropping out).<br></br><br></br>
                Unlike other pools, participants will not rank each and every game. Instead, the pool will
                be divided into a “Rank” portion and a “File” portion. Players will rank only Sunday
                games—the “Rank.” Participants will also predict the winner of the Monday Night
                Football (“MNF”) games—the “File.” Thanksgiving and Christmas will feature special
                components, and all players will participate in a separate playoff round.<br></br><br></br>
                “Winnings,” “awards,” and similar references in these rules and on this site refer to
                fictional money used to measure bragging rights amongst the players.
                </p>
                <h2>The Rank</h2>
                <p>
                Each week, you will pick the straight-up winner of each Sunday NFL game (excluding
                international games) and set a “rank” for each game. This functions more or less as a
                confidence pool: if the team you picked wins the game, you will be awarded the number
                of points corresponding to the rank that you assigned to that game. For example, if you
                picked the Green Bay Packers to beat the Chicago Bears, and you ranked that game at
                #11 for the week, you would be awarded 11 points if Green Bay wins. You will always
                rank each game from 1 to the total number of games there are that particular Sunday.
                So, if there are 14 games on a given Sunday, you will rank each game from 1 to 14, with
                #14 presumably being the team that you are most confident will win their game that
                week. If a game ties, players will be awarded their full points for that game.<br></br><br></br>
                There will a 20-point bonus awarded for getting your #1–#5 ranked games correct in a
                given week. There will also be a 40-point bonus for achieving a perfect Sunday in a given
                week. Tied games do not count as wins for the #1–5 bonus or the perfect week bonus.
                You do not have to get your “File” game (see below) correct to get a perfect week.<br></br><br></br>
                As discussed below, there will be both weekly and season winners. Each week, your
                points totals reset for purposes of determining the weekly winners, but your points
                totals will accrue from week to week for purposes of calculating the season winners.
                </p>
                <h2>The File</h2>
                <p>
                In addition to picking Sunday games each week, we will also pick the winner of MNF
                games. Each MNF game that you pick correctly will go to your “File.” Tie games will also
                count as File wins. <span class="bold-text">The File will not count directly to your weekly or season
                point totals, and it will not directly award any winnings.</span> However, the season winner of
                the File will have their total Playoffs Bucks tripled (see more on Playoffs below), and the
                second-place File finisher will have their Playoffs Bucks doubled. If two or more players
                tie for first or second place in the season-long File standings, all players tied for first or
                second will receive the respective Playoffs bonus.<br></br><br></br>
                During Week 12, the 3 games played on Thursday, November 23 (Thanksgiving Day)
                will be part of the File (in addition to the MNF game played on November 27). Hitting
                all three Thanksgiving games is a <span class="bold-text">Turkey Trifecta</span>, and it adds 3 bonus wins <span class="bold-text">to your
                File</span> (in addition to the three total File wins necessarily awarded for winning each
                game).<br></br><br></br>
                During Week 16, the 3 games played on Monday, December 25 (Christmas Day) will be
                part of the File. Hitting all three Christmas games is a <span class="bold-text">Santa Hat Trick</span>, and it awards
                3 bonus wins <span class="bold-text">to your File</span> (in addition to the three total File wins necessarily awarded
                for winning each game).<br></br><br></br>
                Hitting <span class="italic-text">both</span> the Turkey Trifecta <span class="italic-text">and</span> Santa Hat Trick awards an additional three bonus
                wins <span class="bold-text">to your File</span>.
                </p>
                <h2>Playoffs</h2>
                <p>
                All players will participate in the Playoffs. Players earn 100 Playoff Bucks for each
                straight-up Rank win or tie, regardless of how the player ranked each game. Then, as
                discussed above, the season-long winner(s) and runner(s)-up of the File will have their
                Playoffs Bucks tripled or doubled respectively prior to the start of the Playoffs.<br></br><br></br>
                During the Playoffs, players may wager their Playoffs Bucks on games during every
                round, up to and including the Super Bowl. These wagers will be 1:1 bets made against a
                points spread, which will be circulated and locked into place at some time prior to each
                game. For the first two rounds of the Playoffs, players may also make one parlay bet for
                4 games in the round. In the wildcard round, the player would select 4 of the 6 games to
                include in the parlay. In the divisional round, the player would pick all 4 games in the
                parlay. The parlay bet pays 11:1.<br></br><br></br>
                No Playoffs Bucks will roll over from season to season. The Playoffs pot will be awarded
                to the player with the most Playoffs Bucks after the Super Bowl, with players tied for
                first splitting the pot (even if every player ends the Super Bowl with 0 Playoffs Bucks).
                </p>
                <h2>Dues and Payouts</h2>
                <p>
                Each player’s ante is <span class="bold-text">10 fictional dollars per week</span>, including the commissioner. Total antes for the season are thus <span class="bold-text">180 fictional dollars</span>. As outlined previously, the pool is <span class="bold-text">expected to be a
                season-long activity</span>, though players may join late and are not formally prohibited
                from dropping out. Any player who drops out is not eligible for
                the season or playoffs winnings.<br></br><br></br>
                The pool will go forward no matter how many or how few players enter. The antes
                collected each week will be divided in this fashion:<br></br><br></br>
                <span class="indented-text">1) 65% to the weekly pot</span><br></br>
                <span class="indented-text">2) 20% to the season pot</span><br></br>
                <span class="indented-text">3) 15% to the playoffs pot</span><br></br><br></br>
                Each week, the weekly pot will be divided in this fashion:<br></br><br></br>
                <span class="indented-text">1) 65% to the 1st place player</span><br></br>
                <span class="indented-text">2) 30% to the 2nd place player</span><br></br>
                <span class="indented-text">3) 5% to the 3rd place player</span><br></br><br></br>
                The season pot will be divided in this fashion:<br></br><br></br>
                <span class="indented-text">1) 180 fictional dollars to the 2nd place player (awarded only if at least 10 players participate)</span><br></br>
                <span class="indented-text">2) the rest to the 1st place player.</span><br></br><br></br>
                All ties will be divided evenly by tying players (meaning multiple players tying for first
                place in a given week may earn less than a single second-place weekly finisher). The
                commissioner will personally guarantee all payouts.
                </p>
                <h2>Submitting Picks</h2>
                <p>
                Players will submit picks through a picks-submission link. When players join the pool,
                they will provide their email and receive a link to submit their picks each week.<br></br><br></br>
                <span class="bold-text">All players must submit picks through the survey link by kickoff of the first
                wagered game of the week</span> (because international games are excluded, this means
                the deadline is 1:00PM ET on Sunday in every week except Week 12, which will be
                12:30PM ET on Thanksgiving Day, Thursday, November 23). Games prior to our first
                played game (i.e. Thursday Night Football games, Friday games, Saturday games, and
                international games) will not appear on the weekly picks survey.<br></br><br></br>
                The new picks-submission link will lead to a new, custom-built website. Unlike
                RunYourPool (used last year), the new form does not require any special ranking
                modifications to accommodate File games or non-wagered games. The form is tailored
                to our pool and even more straightforward than RunYourPool.<br></br><br></br>
                If a player fails to submit picks on time, they will not be eligible to participate in the
                Rank that week (dues are still assessed), but they may still make a File selection prior to
                the File game kickoff by emailing the commissioner. Players are encouraged to submit
                picks early to avoid any technical issues, particularly in the early weeks of the pool. If
                any player needs assistance with submitting picks, they are encouraged to contact the
                commissioner or Andrew Thompson (ajt118@case.edu).<br></br><br></br>
                The pick-submission website will be administered by Andrew Thompson and a non-player, Charlie Thompson. Only Andrew and Charlie will have access to players’ picks,
                and they will not disseminate players’ picks prior to kickoff. To ensure fairness, Andrew
                will email his own picks at least 24 hours prior to kickoff to a different member of the
                pool (not a member of Andrew’s family) each week.
                </p>
                <h2>Viewing Picks and Results</h2>
                <p>
                Unlike last year, in which players viewed one another’s picks through RunYourPool
                (which contained inaccurate points totals) and received results via an Excel spreadsheet
                at the end of the week, this year, players will be able to see picks and results after each
                game via a Google Sheet. This Google Sheet will be shared with players via email and
                will be updated with all players’ picks shortly after kickoff. The Sheet will be updated
                with results throughout game days. Additionally, players may make their own local copy
                of the Sheet and use the game interface to test how different game outcomes might
                influence the results. If any player has questions about the Sheet, they are encouraged to
                contact Andrew Thompson (ajt118@case.edu).
                </p>
                <h2>Parting Thoughts and Dispute Resolution</h2>
                <p>
                The goal is that we all have a very fun and entertaining season. This pool is driven by
                competition and camaraderie. After being in a pool for over 20 years, I could not
                imagine missing this aspect of the NFL season. This pool will be run with the utmost
                honesty and fairness to all. Although the pool is now in its second year, there
                nonetheless may be considerations that I have overlooked or forgotten to mention. All
                unforeseen scenarios will be judged in the commissioner’s sole discretion with an eye
                towards fairness and after opportunity for notice and comment from the players. If you
                have any questions or suggestions, please let me know. I hope to have a big crew and
                years of fun. Good luck to all!
                </p>
                <p className='complimentary-close'>
                <span className='underline-text'>Glenn Thompson</span><br></br>
                Commissioner<br></br>
                thompson.glenn3672@gmail.com<br></br>
                (937) 559-9950<br></br>
                </p>
            </div>
        </div>
    </>
  )
}
