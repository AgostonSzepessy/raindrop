#Building
When I was testing the game, I ran it on XAMPP so that's what the instructions will be using. 

Clone the repo in the `xampp/htdocs/` directory.
Then create a new database and table using these commands:

```sql
CREATE DATABASE raindrop_database
CREATE TABLE scores(id INT NOT NULL AUTO_INCREMENT, score INT NOT NULL, PRIMARY KEY(id))
```

Since error checking for an empty database isn't in place yet, also add a default value:

```sql
INSERT INTO `scores` (`score`) VALUES (0)
```

Start XAMPP and go to `localhost/raindrop` and play the game.

#Controls
A or Left Arrow - Move the bucket left
D or Right Arrow - Move the bucket right
Space - When in main menu, go to play state