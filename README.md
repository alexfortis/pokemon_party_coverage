# Pokemon Party Coverage
## Goal
This project will mathematically determine the fewest Pokemon attack types needed to have at least one super-effective attack available for any opposing Pokemon a Trainer might come across.
## Status
The only capability so far is to scrape and store the type effectiveness chart in JSON format, with the keys being the defensive types. It's stored in this format because my algorithm will be eliminating defensive types rather than offensive ones.
## Algorithm
First, ensure that every type with only one weakness has that weakness covered. That means every list will have Fighting (for Normal), Ground (for Electric and Dark/Poison), Grass (for Water/Ground), Fairy (for Dark/Ghost), Dark (for Ghost/Normal), and Fire (for Bug/Steel).

Then, at each step, sort the remaining attack types by the number of uncovered defensive types they are super effective against. Choose the one with the most. See what happens when it's included, and when it isn't. This is a recursive algorithm.
