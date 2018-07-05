1. Query the total amount of merit for a user
  a. Sendable merit = half of the merit a user has received on the ledger
2. Query the merit sources for a user
3. If there are no merit sources
  a. Return sendable merit and month limit
  b. [sendable merit, monthlyLimit] -> [sendable merit, 0]
4. If there are merit sources
  a. Query all merit sends from the user
  b. Track position and date range
    i. Keep track of the source merit sends in the past range of days { amount, date }
    ii. Keep track of the source merit sends sum for the range
    iii. Keep track of the total user merit sends
    iv. Keep track of the current source merit index
  c. Iterate over each send (ordered by time)
    i. If there is a more current source merit (current send is covered by next index)
      1. Drop the entire range of source merit sends
      2. Clear the source merit sends sum
      3. Update the current source merit index
    ii. While the oldest source merit send in the range exceeds 30 days of age
      1. Drop the oldest source merit send from the range
      2. Subtract the source merit send amount from the source merit sends sum
    iii. Calculate the remaining/left over source merit for the current 30 day range:
      Max(current source merit - sum of source merit sends in range, 0)
    iv. Accumulate user merit sends:
      Total user merit sends += Max(current send amount - remaining source merit, 0)
    v. Calculate the current source merit sent for the current send:
      Min(remaining source merit, current send amount)
      Source merit sent is derived from the send amount, but never exceeds the
      remaining source merit amount.
    vi. Add current source merit sent to the source merit sends
    vii. Add the source merit sent amount to source merit sends sum
  d. Subtract the user merit sends from sendable merit
  e. Calculate sendable source merit (month limit)
    i. Use the latest source merit index
    ii. Update source merit sends from the range as previously described, except
      using now as the current time.  If out of 30 day range:
      1. Drop the source merit send from the range
      2. Subtract the source merit send amount from the source merit sends sum
    iii. Sendable source merit = Max(latest source merit - source merit sends sum, 0)
5. Return sendable merit and month limit
