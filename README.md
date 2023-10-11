# Mafia Game

Note 2023-Oct-11: halted for about 2 weeks; I'm on vacation

## Contributing
<details>
  <summary markdown="span">How to contribute</summary>

  1. Fork the repository
     
  2. Clone the repository:
  
  ```git
  git clone https://github.com/YOURGithubUserName/mafia.git
  ```

  3. Create a new branch

  ```
  cd mafia
  git checkout -b <descriptive-branch-name-without-arrows>
  ```

  4. Make your changes

  5. Stage your changes and commit
     
  ```git
  git add -A
  git commit -m "your commit message"
  git push --set-upstream origin <your-branch-name-without-arrows>
  ```

  6. Open the repository in the browser

     Open the fork in your browser, go to Pull Requests and submit a pull request with a descriptive name:
     
     ![pic 1](https://assets.digitalocean.com/articles/eng_python/PullRequest/PRButton.png)

     ![pic 2](https://assets.digitalocean.com/articles/eng_python/PullRequest/PullRequest.png)

  7. Press "Create pull request"

  8. Done. Good job.
</details>

## Information
Amount of players: 8-16

### _Formula for n(Mafia players):_
* M = N / k
* M -> amount of mafia players
* k -> coefficient, mostly around 3-4
* The result is rounded to the lower side - math.floor

_Must always vote; refraining = voting for yourself_

### _Teams:_
* Civilians (Sheriff included) [TC]
* Mafia [TM]

### _Roles:_
* Civilians
* Sheriff
* Mafia
* Don (Sheriff equiv. of Mafia)

### _Voting:_
* All votes are equal -> skip
* If it is the first day and only one person has been "flagged" (for all votes: -1 until votes of at least one player are 0), then the voting is skipped
* For someone to get kicked, one person (when >=3 players) must get at least 2/3 of the votes
* For votes to begin the 2nd time, 2 people must get equal amount of votes, ONLY WHEN >=4 players

### _Game routine:_
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
