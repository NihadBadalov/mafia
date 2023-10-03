# Mafia Game

Amount of players: 8-16

## Formula for n(Mafia players):
* M = N / k
* M -> amount of mafia players
* k -> coefficient, mostly around 3-4
* The result is rounded to the lower side - math.floor

_Must always vote; refraining = voting for yourself_

## Teams:
* Civilians (Sheriff included) [TC]
* Mafia [TM]

## Roles:
* Civilians
* Sheriff
* Mafia
* Don (Sheriff equiv. of Mafia)

## Voting:
* All votes are equal -> skip
* If it is the first day and only one person has been "flagged" (for all votes: -1 until votes of at least one player are 0), then the voting is skipped
* For someone to get kicked, one person (when >=3 players) must get at least 2/3 of the votes
* For votes to begin the 2nd time, 2 people must get equal amount of votes, ONLY WHEN >=4 players

## Game routine:
* First night
* * Mafia meets each other for 30sec to come up with a game plan
* Nights
* * Mafia wakes up, has 45 second to discuss who to kill & press buttons, Mafia sleeps
* * Don wakes up, his time is joint with Mafia's, he has to choose a player who will get killed, he gets told whether or not the killed player was the Sheriff, Don sleeps
* * Sheriff wakes up, has 25 seconds to choose someone, he will get told whether or not that player was on team Mafia
* Days
* * It is announced who died (if any)
* * The killed player(-s) have 45 seconds of a "post-death speech." 
-- Days and nights go on until n(TM) == n(TC) -> where TM wins; or n(TM) == 0 -> where TC wins
