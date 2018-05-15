1. Query the total amount of merit for a user
  a. Sendable merit = half of the merit a user has received on the ledger
2. Query the merit sources for a user
3. If there are no merit sources
  a. Return sendable merit and month limit
  b. [sendable merit, monthlyLimit] -> [sendable merit, 0]
4. If there are merit sources
  a. Calculate the total sent merit in exceess of source merit for each time range:
    i. Before source merit was allocated
      - Query merit for time < first source merit time
      - Add directly to excess sent merit
    ii. Between source merit allocations
      - Query merit for time > current index source merit time,
        and time < next index source merit time
      - Add excess in difference between sent merit and source merit
        to excess sent merit
    iii. After the latest source merit allocation
      - Query merit > latest source merit time
      - Add excess in difference between sent merit and source merit
        to excess sent merit
  b. Sum merit exceeding source merit
  c. Subtract the sum of excess sent merit from sendable merit
5. Return sendable merit and month limit
  a. Sendable merit from calculation
  b. Month limit from latest merit allocation, minus the sent merit since
allocation
