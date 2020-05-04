# On init,
1. Listen for `load` event
2. Listen for `hashchange` event
3. Listen for `popstate` event
4. Listen for manual pushState event
5. Intercept all link clicks

# On load event
1. Extract URL info
2. Compare and run internal URL update if needed

# On popstate event
1. Extract URL info
2. Compare and run internal URL update if needed

# On hashchange event
1. Extract the latest hash from URL
2. Compare and run internal URL update with before route change handler if needed

# On manual pushState event
1. Extract URL info
2. Compare and run internal URL update with before route change handler if needed

# On link click
1. Check if the link should be intercepted
2. Continue to 3. for intercept-able link
3. Extract URL info from link's href
4. Compare and run internal URL update with before route change handler if needed

# Internal URL update
1. When `skipCheck=false`, compare the old and new route to determine if route change is needed.
2. Continue to 3. for a new route
3. Continue to 4. for a matched route, else run http-404 handler.
4. Find matched route then fire manual pushState event with the route matched keys

# Internal URL update with before route change handler
1. Compare old and new route to determine if route change is needed
2. Find before route change handler for the current route and continue to 3. if found one.
   Else, skip to 4.
3. Execute before route change handler and wait for route change approval.
   Continue to 4. for an approved route change.
4. Run internal URL update with `skipCheck=true`.

# 404 handler
1. Fire manual pushState event with `notFound=true` to notify a not-found route

# Internal URL update with before route change handler
1. Find matched route
1. If matched route, fire URL change event with matched groups
2. Else, run 404 route handler for a not-found route
