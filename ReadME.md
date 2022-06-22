# DMS - Dikter Management System

# Endpoints: 

## /poems

### GET

#### URLSearchParams

**Example**: ?source=Dikter&sort=year_asc&tags=6257f241b117a43f9dc001e6+6257f23bb117a43f9dc000ff&title=ing&page=1&size=15

| name  | req.|  explanation       | options |
|-------|---------|----------------|---------|
| source|   ❌   | Isolate by book | Dikter, Framtidens skugga, Landet som icke är, Rosaltaret, Septemberlyran, Tankar om naturen
| sort  |   ❌   | Prop to sort by | title_asc, title_desc, year_asc, year_desc, author_asc, author_desc
| tags  |   ❌   | Tags to include| multiple, by id
| title |   ❌   | Search by title | Any string
| page  |   ❌   | Page number | Any number
| size  |   ❌   | Page size | Any number
