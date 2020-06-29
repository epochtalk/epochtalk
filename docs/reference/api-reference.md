---
title: API Reference
---

<a name="top"></a>
# API Reference

Overview of Epochtalk API

 - [Ads](#Ads)
   - [Ad Analytics](#Ad-Analytics)
   - [Create Ad](#Create-Ad)
   - [Create Ad Round](#Create-Ad-Round)
   - [Create Factoid](#Create-Factoid)
   - [Disable Factoid](#Disable-Factoid)
   - [Duplicate Ad](#Duplicate-Ad)
   - [Enable Factoid](#Enable-Factoid)
   - [Remove Ad](#Remove-Ad)
   - [Remove Factoid](#Remove-Factoid)
   - [Rotate Ad Round](#Rotate-Ad-Round)
   - [Save Ad View Text](#Save-Ad-View-Text)
   - [Update Ad](#Update-Ad)
   - [Update Factoid](#Update-Factoid)
   - [View Ad](#View-Ad)
   - [View Ad Round](#View-Ad-Round)
   - [View Round Information](#View-Round-Information)
 - [Auth](#Auth)
   - [Authenticate User](#Authenticate-User)
   - [Confirm Account](#Confirm-Account)
   - [Email Availability](#Email-Availability)
   - [Login](#Login)
   - [Logout](#Logout)
   - [Recover Account](#Recover-Account)
   - [Register (via invitation)](#Register-(via-invitation))
   - [Register (w/ account verification)](#Register-(w/-account-verification))
   - [Register (w/o account verification)](#Register-(w/o-account-verification))
   - [Reset Account Password](#Reset-Account-Password)
   - [Username Availability](#Username-Availability)
   - [Validate Account Reset Token](#Validate-Account-Reset-Token)
 - [AutoModeration](#AutoModeration)
   - [Add Rule](#Add-Rule)
   - [Edit Rule](#Edit-Rule)
   - [Remove Rule](#Remove-Rule)
   - [View Rules](#View-Rules)
 - [Bans](#Bans)
   - [(Admin) Add Ban Addresses](#(Admin)-Add-Ban-Addresses)
   - [(Admin) Ban](#(Admin)-Ban)
   - [(Admin) Ban From Boards](#(Admin)-Ban-From-Boards)
   - [(Admin) Delete Ban Address](#(Admin)-Delete-Ban-Address)
   - [(Admin) Edit Ban Address](#(Admin)-Edit-Ban-Address)
   - [(Admin) Get User&#39;s Banned Boards](#(Admin)-Get-User&#39;s-Banned-Boards)
   - [(Admin) Page by Banned Addresses](#(Admin)-Page-by-Banned-Addresses)
   - [(Admin) Page by Banned Boards](#(Admin)-Page-by-Banned-Boards)
   - [(Admin) Unban](#(Admin)-Unban)
   - [(Admin) Unban From Boards](#(Admin)-Unban-From-Boards)
 - [Boards](#Boards)
   - [All Boards](#All-Boards)
   - [Create](#Create)
   - [Delete](#Delete)
   - [Find Board](#Find-Board)
   - [Move Boards](#Move-Boards)
   - [Update](#Update)
   - [Update All Boards Categorized](#Update-All-Boards-Categorized)
 - [Breadcrumbs](#Breadcrumbs)
   - [Find](#Find)
 - [Categories](#Categories)
   - [All Categories (Filters Private)](#All-Categories-(Filters-Private))
   - [All Categories (Includes Private)](#All-Categories-(Includes-Private))
   - [Create Categories](#Create-Categories)
   - [Delete Categories](#Delete-Categories)
 - [Conversations](#Conversations)
   - [Create](#Create)
   - [Delete](#Delete)
   - [Messages in Conversation](#Messages-in-Conversation)
 - [Legal](#Legal)
   - [(Admin) Reset Legal Text](#(Admin)-Reset-Legal-Text)
   - [(Admin) Text](#(Admin)-Text)
   - [(Admin) Update](#(Admin)-Update)
 - [Mentions](#Mentions)
   - [Delete Mentions](#Delete-Mentions)
   - [Get Mention Settings](#Get-Mention-Settings)
   - [Ignore User&#39;s Mentions](#Ignore-User&#39;s-Mentions)
   - [Page Ignored Users](#Page-Ignored-Users)
   - [Remove Thread Subscriptions](#Remove-Thread-Subscriptions)
   - [Toggle Mention Emails](#Toggle-Mention-Emails)
   - [Unignore User&#39;s Mentions](#Unignore-User&#39;s-Mentions)
   - [View Mentions](#View-Mentions)
 - [Messages](#Messages)
   - [Create](#Create)
   - [Delete](#Delete)
   - [Get Messages Settings](#Get-Messages-Settings)
   - [Get Recent Messages](#Get-Recent-Messages)
   - [Ignore User&#39;s Messages](#Ignore-User&#39;s-Messages)
   - [Page Ignored Users](#Page-Ignored-Users)
   - [Toggle Message Emails](#Toggle-Message-Emails)
   - [Toggle Newbie Messages](#Toggle-Newbie-Messages)
   - [Unignore User&#39;s Messages](#Unignore-User&#39;s-Messages)
 - [Moderation](#Moderation)
   - [(Admin) Page Moderation Log](#(Admin)-Page-Moderation-Log)
 - [Moderators](#Moderators)
   - [Add Moderator](#Add-Moderator)
   - [Remove Moderator](#Remove-Moderator)
 - [MOTD](#MOTD)
   - [Get Message of the Day](#Get-Message-of-the-Day)
   - [Set Message of the Day](#Set-Message-of-the-Day)
 - [Notifications](#Notifications)
   - [Dismiss](#Dismiss)
   - [Get Notifications counts](#Get-Notifications-counts)
 - [Portal](#Portal)
   - [Portal Contents](#Portal-Contents)
 - [Posts](#Posts)
   - [Create](#Create)
   - [Delete](#Delete)
   - [Find](#Find)
   - [Lock](#Lock)
   - [Page By Thread](#Page-By-Thread)
   - [Page By User](#Page-By-User)
   - [Page First Posts By User](#Page-First-Posts-By-User)
   - [Purge](#Purge)
   - [Search Posts](#Search-Posts)
   - [Undelete](#Undelete)
   - [Unlock](#Unlock)
   - [Update](#Update)
 - [Rank](#Rank)
   - [Get Ranks](#Get-Ranks)
   - [Upsert Rank](#Upsert-Rank)
 - [Reports](#Reports)
   - [(Admin) Create Message Report Note](#(Admin)-Create-Message-Report-Note)
   - [(Admin) Create Post Report Note](#(Admin)-Create-Post-Report-Note)
   - [(Admin) Create User Report Note](#(Admin)-Create-User-Report-Note)
   - [(Admin) Page Message Report](#(Admin)-Page-Message-Report)
   - [(Admin) Page Message Report Notes](#(Admin)-Page-Message-Report-Notes)
   - [(Admin) Page Post Report](#(Admin)-Page-Post-Report)
   - [(Admin) Page Post Report Notes](#(Admin)-Page-Post-Report-Notes)
   - [(Admin) Page User Report](#(Admin)-Page-User-Report)
   - [(Admin) Page User Report Notes](#(Admin)-Page-User-Report-Notes)
   - [(Admin) Update Message Report](#(Admin)-Update-Message-Report)
   - [(Admin) Update Message Report Note](#(Admin)-Update-Message-Report-Note)
   - [(Admin) Update Post Report](#(Admin)-Update-Post-Report)
   - [(Admin) Update Post Report Note](#(Admin)-Update-Post-Report-Note)
   - [(Admin) Update User Report](#(Admin)-Update-User-Report)
   - [(Admin) Update User Report Note](#(Admin)-Update-User-Report-Note)
   - [Create Message Report](#Create-Message-Report)
   - [Create Post Report](#Create-Post-Report)
   - [Create User Report](#Create-User-Report)
 - [Roles](#Roles)
   - [Add Roles](#Add-Roles)
   - [All Roles](#All-Roles)
   - [Page Users with Role](#Page-Users-with-Role)
   - [Remove Roles](#Remove-Roles)
   - [Reprioritize Roles](#Reprioritize-Roles)
   - [Update Roles](#Update-Roles)
 - [Settings](#Settings)
   - [(Admin) Add IP Rule to Blacklist](#(Admin)-Add-IP-Rule-to-Blacklist)
   - [(Admin) Delete existing IP Rule from Blacklist](#(Admin)-Delete-existing-IP-Rule-from-Blacklist)
   - [(Admin) Find](#(Admin)-Find)
   - [(Admin) Get Blacklist](#(Admin)-Get-Blacklist)
   - [(Admin) Get Theme](#(Admin)-Get-Theme)
   - [(Admin) Preview Theme](#(Admin)-Preview-Theme)
   - [(Admin) Reset Theme](#(Admin)-Reset-Theme)
   - [(Admin) Set Theme](#(Admin)-Set-Theme)
   - [(Admin) Update existing IP Rule in Blacklist](#(Admin)-Update-existing-IP-Rule-in-Blacklist)
   - [Update](#Update)
 - [ThreadNotifications](#ThreadNotifications)
   - [Get Thread Notification Settings](#Get-Thread-Notification-Settings)
   - [Toggle Thread Notifications](#Toggle-Thread-Notifications)
 - [Threads](#Threads)
   - [Create](#Create)
   - [Create Poll](#Create-Poll)
   - [Edit Poll](#Edit-Poll)
   - [Lock](#Lock)
   - [Lock/Unlock Poll](#Lock/Unlock-Poll)
   - [Mark Thread Viewed](#Mark-Thread-Viewed)
   - [Move](#Move)
   - [Page By Board](#Page-By-Board)
   - [Page Recently Posted In Threads](#Page-Recently-Posted-In-Threads)
   - [Purge](#Purge)
   - [Remove Vote](#Remove-Vote)
   - [Sticky](#Sticky)
   - [Title](#Title)
   - [Vote](#Vote)
 - [Trust](#Trust)
   - [Add Trust Board](#Add-Trust-Board)
   - [Add Trust Feedback](#Add-Trust-Feedback)
   - [Delete Trust Board](#Delete-Trust-Board)
   - [Edit Default Trust List](#Edit-Default-Trust-List)
   - [Edit Trust List](#Edit-Trust-List)
   - [Get Default Trust List](#Get-Default-Trust-List)
   - [Get Trust Boards](#Get-Trust-Boards)
   - [Get Trust Feedback](#Get-Trust-Feedback)
   - [Get Trust List](#Get-Trust-List)
   - [Get Trust Score Statistics](#Get-Trust-Score-Statistics)
   - [Get Trust Tree](#Get-Trust-Tree)
 - [Users](#Users)
   - [(Admin) Add Roles](#(Admin)-Add-Roles)
   - [(Admin) Count Users](#(Admin)-Count-Users)
   - [(Admin) Create User Note](#(Admin)-Create-User-Note)
   - [(Admin) Delete User Note](#(Admin)-Delete-User-Note)
   - [(Admin) Page User Notes](#(Admin)-Page-User-Notes)
   - [(Admin) Page Users](#(Admin)-Page-Users)
   - [(Admin) Recover Account](#(Admin)-Recover-Account)
   - [(Admin) Remove Roles](#(Admin)-Remove-Roles)
   - [(Admin) Search Usernames](#(Admin)-Search-Usernames)
   - [(Admin) Update User Note](#(Admin)-Update-User-Note)
   - [Deactivate](#Deactivate)
   - [Delete](#Delete)
   - [Find](#Find)
   - [Ignore User Posts](#Ignore-User-Posts)
   - [Invitation Exists](#Invitation-Exists)
   - [Invitations](#Invitations)
   - [Invite](#Invite)
   - [Page Ignored Users](#Page-Ignored-Users)
   - [Page Users](#Page-Users)
   - [Preferences](#Preferences)
   - [Reactivate](#Reactivate)
   - [Remove Invite](#Remove-Invite)
   - [Resend](#Resend)
   - [Unignore User Posts](#Unignore-User-Posts)
   - [Update](#Update)
   - [User Lookup](#User-Lookup)
 - [Watchlist](#Watchlist)
   - [Page Watchlist Boards](#Page-Watchlist-Boards)
   - [Page Watchlist Threads](#Page-Watchlist-Threads)
   - [Page Watchlist Unread](#Page-Watchlist-Unread)
   - [Unwatch Board](#Unwatch-Board)
   - [Unwatch Thread](#Unwatch-Thread)
   - [View Edit Watchlist](#View-Edit-Watchlist)
   - [Watch Board](#Watch-Board)
   - [Watch Thread](#Watch-Thread)

___


# <a name='Ads'></a> Ads

## <a name='Ad-Analytics'></a> Ad Analytics
[Back to top](#top)

<p>Returns analytics for the current ad round</p>

```
GET /ads/analytics/:round
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| round | `object` | <p>Object containing data about the round</p> |
| round.viewing | `number` | <p>The round of ads that analytics are being displayed for</p> |
| round.current | `number` | <p>The round of ads that are currentlying running</p> |
| round.previous | `number` | <p>The previous round</p> |
| round.next | `number` | <p>The next round</p> |
| round.start_time | `timestamp` | <p>The timestamp of when the round started</p> |
| round.end_time | `timestamp` | <p>The timestamp of when the round ended</p> |
| analytics | `object[]` | <p>Object containing analytics data about each ad in the round, index of ad corresponds the ad number</p> |
| analytics.total_impressions | `number` | <p>The total number of impressions for this ad</p> |
| analytics.total_authed_impressions | `number` | <p>The total number of impressions for this ad from authorized users (not unique)</p> |
| analytics.total_unique_ip_impressions | `number` | <p>The total number of impressions for this ad from unique ip addresses</p> |
| analytics.total_unique_authed_users_impressions | `number` | <p>The total number of impressions for this ad from authorized users (unique)</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error viewing the analytics for ads</p> |

## <a name='Create-Ad'></a> Create Ad
[Back to top](#top)

<p>Used to create a new ad within a round</p>

```
POST /ads
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| round | `number` | <p>The number of the round to create ad for</p> |
| html | `string` | <p>The html source of the ad</p> |
| css | `string` | **optional** <p>The css backing the html source</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the created ad</p> |
| round | `number` | <p>The round in which the ad was created</p> |
| html | `string` | <p>The html source for the ad</p> |
| css | `string` | <p>The css source for the ad</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error creating the ad</p> |

## <a name='Create-Ad-Round'></a> Create Ad Round
[Back to top](#top)

<p>Used to create a new ad round</p>

```
POST /ads/rounds
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| round | `number` | <p>The number of the round which was created</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error creating the ad round</p> |

## <a name='Create-Factoid'></a> Create Factoid
[Back to top](#top)

<p>Used to create a new factoid</p>

```
POST /ads/factoids
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| text | `string` | <p>The factoid text</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the created factoid</p> |
| text | `string` | <p>The factoid text</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error creating the factoid</p> |

## <a name='Disable-Factoid'></a> Disable Factoid
[Back to top](#top)

<p>Used to disable factoids</p>

```
PUT /ads/factoids/:id/disable
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the factoid to disable, pass 'all' in to disable all factoids</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Sucess | `Object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error disabling the factoid</p> |

## <a name='Duplicate-Ad'></a> Duplicate Ad
[Back to top](#top)

<p>Used to duplicate an ad within a round</p>

```
POST /ads/:id/duplicate
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the ad to duplicate</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `id` | <p>The id of the duplicated ad</p> |
| round | `string` | <p>The round in which the ad was created</p> |
| html | `string` | <p>The html source for the ad</p> |
| css | `string` | <p>The css source for the ad</p> |
| created_at | `timestamp` | <p>The created at timestamp for the ad</p> |
| updated_at | `timestamp` | <p>The updated at timestamp for the ad</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error duplicating the ad</p> |

## <a name='Enable-Factoid'></a> Enable Factoid
[Back to top](#top)

<p>Used to enable factoids</p>

```
PUT /ads/factoids/:id/enable
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the factoid to enable, pass 'all' in to enable all factoids</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Sucess | `Object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error enabling the factoid</p> |

## <a name='Remove-Ad'></a> Remove Ad
[Back to top](#top)

<p>Used to remove an ad</p>

```
DELETE /ads/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the ad to remove</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| HTTP | `object` | <p>Code STATUS 200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error removing the ad</p> |

## <a name='Remove-Factoid'></a> Remove Factoid
[Back to top](#top)

<p>Used to remove a factoid</p>

```
DELETE /ads/factoids/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the factoid to remove</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| HTTP | `object` | <p>Code STATUS 200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error removing the factoid</p> |

## <a name='Rotate-Ad-Round'></a> Rotate Ad Round
[Back to top](#top)

<p>Used to put a round of ads into rotation</p>

```
POST /ads/rounds/rotate
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| round | `number` | <p>The round of ads to rotate to</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| round | `number` | <p>The integer value of the round</p> |
| current | `boolean` | <p>Boolean indicating if this is the current round</p> |
| start_time | `timestamp` | <p>Start of the round timestamp</p> |
| end_time | `timestamp` | <p>End of the round timestamp</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error rotating the ad round</p> |

## <a name='Save-Ad-View-Text'></a> Save Ad View Text
[Back to top](#top)

<p>Used to save ad info and disclaimer text to be displayed in Ad related views</p>

```
POST /ads/text
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| disclaimer | `string` | <p>The disclaimer text html source for ads</p> |
| info | `string` | <p>The information text html source for ads</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| disclaimer | `string` | <p>The disclaimer text html source for ads</p> |
| info | `string` | <p>The information text html source for ads</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error saving the ad view text</p> |

## <a name='Update-Ad'></a> Update Ad
[Back to top](#top)

<p>Used to update an ad</p>

```
PUT /ads/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the ad to update</p> |

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| html | `string` | <p>The updated html source</p> |
| css | `string` | <p>The updated css source</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the ad to update</p> |
| html | `string` | <p>The updated html source</p> |
| css | `string` | <p>The updated css source</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error updating the ad</p> |

## <a name='Update-Factoid'></a> Update Factoid
[Back to top](#top)

<p>Used to update a factoid</p>

```
PUT /ads/factoids/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the factoid to update</p> |

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| text | `string` | <p>The updated factoid text</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the factoid which was update</p> |
| text | `string` | <p>The updated factoid text</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error updating the factoid</p> |

## <a name='View-Ad'></a> View Ad
[Back to top](#top)

<p>Returns a random ad out of the round of circulated ads</p>

```
GET /ads/
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the ad</p> |
| round | `string` | <p>The round in which the ad is running</p> |
| html | `string` | <p>The html source for the ad</p> |
| css | `string` | <p>The css source for the ad</p> |
| created_at | `timestamp` | <p>The created at timestamp for the ad</p> |
| updated_at | `timestamp` | <p>The updated at timestamp for the ad</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error viewing the ad</p> |

## <a name='View-Ad-Round'></a> View Ad Round
[Back to top](#top)

<p>Returns ads, factoids, and data for specified round</p>

```
GET /ads/rounds/:roundNumber
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| roundNumber | `string` | <p>The round number to view, or &quot;current&quot; to view current round</p> |

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| type | `string` | **optional** <p>What html source text to bring back with the data</p>_Allowed values: "disclaimer","info","both"_ |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| ads | `object[]` | <p>An array of ads in the specified round</p> |
| ads.id | `string` | <p>The id of the ad</p> |
| ads.round | `number` | <p>The round number of the ad</p> |
| ads.html | `string` | <p>The html source for the ad</p> |
| ads.css | `string` | <p>The css source for the ad</p> |
| ads.display_html | `string` | <p>The compiled display html</p> |
| ads.display_css | `string` | <p>The compiled display css</p> |
| ads.created_at | `timestamp` | <p>The created at timestamp for the ad</p> |
| ads.updated_at | `timestamp` | <p>The updated at timestamp for the ad</p> |
| factoids | `object[]` | <p>An array of factoids in circulation</p> |
| factoids.id | `string` | <p>The id of the factoid</p> |
| factoids.text | `string` | <p>The factoid text</p> |
| factoids.enabled | `boolean` | <p>Boolean indicating if factoid is enabled</p> |
| factoids.created_at | `timestamp` | <p>The created at timestamp for the factoid</p> |
| factoids.updated_at | `timestamp` | <p>The updated at timestamp for the factoid</p> |
| text | `object` | <p>Object which contains ad disclaimers and informations</p> |
| text.info | `string` | <p>HTML source for ad info to be displayed</p> |
| text.disclaimer | `string` | <p>HTML source for ads disclaimer to be displayed</p> |
| round | `object` | <p>Object containing data about the round</p> |
| round.viewing | `number` | <p>The round of ads that analytics are being displayed for</p> |
| round.current | `number` | <p>The round of ads that are currentlying running</p> |
| round.previous | `number` | <p>The previous round</p> |
| round.next | `number` | <p>The next round</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error viewing the round</p> |

## <a name='View-Round-Information'></a> View Round Information
[Back to top](#top)

<p>Returns information about the current ad round</p>

```
GET /ads/rounds/info
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| ads | `object[]` | <p>An array of ads in the current round</p> |
| ads.id | `string` | <p>The id of the ad</p> |
| ads.round | `number` | <p>The round number of the ad</p> |
| ads.html | `string` | <p>The html source for the ad</p> |
| ads.css | `string` | <p>The css source for the ad</p> |
| ads.display_html | `string` | <p>The compiled display html</p> |
| ads.display_css | `string` | <p>The compiled display css</p> |
| ads.created_at | `timestamp` | <p>The created at timestamp for the ad</p> |
| ads.updated_at | `timestamp` | <p>The updated at timestamp for the ad</p> |
| factoids | `object[]` | <p>An array of factoids in circulation</p> |
| factoids.id | `string` | <p>The id of the factoid</p> |
| factoids.text | `string` | <p>The factoid text</p> |
| factoids.enabled | `boolean` | <p>Boolean indicating if factoid is enabled</p> |
| factoids.created_at | `timestamp` | <p>The created at timestamp for the factoid</p> |
| factoids.updated_at | `timestamp` | <p>The updated at timestamp for the factoid</p> |
| text | `object` | <p>Object which contains info to be displayed on the /ads/info view</p> |
| text.info | `string` | <p>HTML source to be displayed on the /ads/info view</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error viewing the round information</p> |

# <a name='Auth'></a> Auth

## <a name='Authenticate-User'></a> Authenticate User
[Back to top](#top)

<p>Used to check the logged in user's authentication.</p>

```
GET /authenticate
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| token | `string` | <p>User's unique session token</p> |
| id | `string` | <p>User's unique id</p> |
| username | `string` | <p>User's username</p> |
| avatar | `string` | <p>User's avatar url</p> |
| roles | `string[]` | <p>Array of user's roles lookup strings</p> |
| moderating | `string[]` | <p>Array of user's moderatered board ids</p> |
| permissions | `object` | <p>Object containing user's permissions</p> |

### Error response

#### Error response - `Error 401`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Unauthorized |  | <p>returned when user is not authenticated</p> |

## <a name='Confirm-Account'></a> Confirm Account
[Back to top](#top)

<p>Used to confirm a newly registered account when account verification is enabled in the admin panel.</p>

```
POST /confirm
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>User's unique username.</p> |
| token | `string` | <p>User's confirmation token.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| token | `string` | <p>User's unique session token</p> |
| id | `string` | <p>User's unique id</p> |
| username | `string` | <p>User's username</p> |
| avatar | `string` | <p>User's avatar url</p> |
| roles | `string[]` | <p>Array of user's roles lookup strings</p> |
| moderating | `string[]` | <p>Array of user's moderatered board ids</p> |
| permissions | `object` | <p>Object containing user's permissions</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>Account was not found or confirmation token doesn't match</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue confirming the user account</p> |

## <a name='Email-Availability'></a> Email Availability
[Back to top](#top)

<p>Used to check if an email is available when registering a new account.</p>

```
GET /register/email/:email
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| email | `string` | <p>The email to check</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| found | `boolean` | <p>true if email exists false if not</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue checking email availability</p> |

## <a name='Login'></a> Login
[Back to top](#top)

<p>Used to log a user into their account.</p>

```
POST /login
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>User's unique username</p> |
| password | `string` | <p>User's password</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| token | `string` | <p>User's authentication token</p> |
| id | `string` | <p>User's unique id</p> |
| username | `string` | <p>The user account username</p> |
| avatar | `string` | <p>User's avatar url</p> |
| permissions | `object` | <p>Object containing user's permissions</p> |
| moderating | `string[]` | <p>Array of user's moderated board ids</p> |
| roles | `string[]` | <p>Array of user's roles</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>Invalid credentials were provided or the account hasn't been confirmed</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue logging in</p> |

## <a name='Logout'></a> Logout
[Back to top](#top)

<p>Used to log a user out of their account.</p>

```
DELETE /logout
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| success | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 401`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Unauthorized |  | <p>Occurs when logging out on a view that requires special permissions</p> |

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>No user is currently logged in</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue deleteing user's web token</p> |

## <a name='Recover-Account'></a> Recover Account
[Back to top](#top)

<p>Used to recover an account by username or email. Sends an email with a URL to visit to reset the user's account password.</p>

```
POST /recover/
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| query | `string` | <p>The email or username to attempt to recover</p> |
| recaptcha | `string` | <p>The recaptcha token</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| success | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>Recaptcha not submitted</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error recovering the user's account</p> |

## <a name='Register-(via-invitation)'></a> Register (via invitation)
[Back to top](#top)

<p>Used to register a new account via invitation.</p>

```
POST /join
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| hash | `string` | <p>User's Invitation Hash.</p> |
| username | `string` | <p>User's unique username.</p> |
| email | `string` | <p>The email address to send the invite to.</p> |
| password | `string` | <p>User's password</p> |
| confirmation | `string` | <p>User's confirmed password</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| token | `string` | <p>User's authentication token</p> |
| id | `string` | <p>User's unique id</p> |
| username | `string` | <p>The user account username</p> |
| avatar | `string` | <p>User's avatar url</p> |
| permissions | `object` | <p>Object containing user's permissions</p> |
| moderating | `string[]` | <p>Array of user's moderated board ids</p> |
| roles | `string[]` | <p>Array of user's roles</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>There was an error creating the user via invitation.</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue registering user</p> |

## <a name='Register-(w/-account-verification)'></a> Register (w/ account verification)
[Back to top](#top)

<p>Used to register a new account with account verification enabled in admin settings. This will send an email to the user with the account verification link.</p>

```
POST /register
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>User's unique username.</p> |
| email | `string` | <p>User's email address.</p> |
| password | `string` | <p>User's password</p> |
| confirmation | `string` | <p>User's confirmed password</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| message | `string` | <p>Account creation success message</p> |
| username | `string` | <p>Created user's username</p> |
| confirm_token | `string` | <p>Created user's account confirmation token</p> |
| avatar | `string` | <p>User's avatar url</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>There was an error registering the user</p> |

## <a name='Register-(w/o-account-verification)'></a> Register (w/o account verification)
[Back to top](#top)

<p>Used to register a new account with account verification disabled in admin settings.</p>

```
POST /register
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>User's unique username.</p> |
| email | `string` | <p>User's email address.</p> |
| password | `string` | <p>User's password</p> |
| confirmation | `string` | <p>User's confirmed password</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| token | `string` | <p>User's authentication token</p> |
| id | `string` | <p>User's unique id</p> |
| username | `string` | <p>The user account username</p> |
| avatar | `string` | <p>User's avatar url</p> |
| permissions | `object` | <p>Object containing user's permissions</p> |
| roles | `string[]` | <p>Array of user's roles</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>There was an error creating the user</p> |

## <a name='Reset-Account-Password'></a> Reset Account Password
[Back to top](#top)

<p>Used to reset an account password after recovering an account.</p>

```
POST /reset
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The username of the user whose password is being reset</p> |
| password | `string` | <p>The new account password</p> |
| query | `string` | <p>The new account password confirmation</p> |
| token | `string` | <p>The token for resetting the account password</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| message | `string` | <p>Password Successfully Reset</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>The user account could not be found or the reset token is invalid</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error updating the user account's reset token information</p> |

## <a name='Username-Availability'></a> Username Availability
[Back to top](#top)

<p>Used to check if a username is available when registering a new account.</p>

```
GET /register/username/:username
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The username to check</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| found | `boolean` | <p>true if username exists false if not</p> |

## <a name='Validate-Account-Reset-Token'></a> Validate Account Reset Token
[Back to top](#top)

<p>Used to check the validity of the reset token. Verifys that the reset token is for the correct user and that it is not expired.</p>

```
GET /reset/:username/:token/validate
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The username of the user whose reset token is to be checked</p> |
| token | `string` | <p>The token for resetting the account password</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| token_valid | `boolean` | <p>true if the token is valid false if it is not</p> |
| token_expired | `boolean` | <p>true if token is expired false if not. Undefined if token is invalid</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>The user account could not be found</p> |

# <a name='AutoModeration'></a> AutoModeration

## <a name='Add-Rule'></a> Add Rule
[Back to top](#top)

<p>Used to create a new auto moderation rule</p>

```
POST /automoderation/rules
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| name | `string` | <p>The name of the auto moderation rule</p> |
| description | `string` | <p>The description of what the rule does</p> |
| message | `string` | <p>The error message which is returned to the user</p> |
| conditions | `object[]` | <p>What conditions trigger the rule</p> |
| conditions.params | `string` | <p>The parameter that triggers the rule</p>_Allowed values: "body","thread_id","user_id","title"_ |
| conditions.regex | `object` | <p>A regex used to capture user input and trigger rule</p> |
| conditions.regex.pattern | `string` | <p>The regex pattern</p> |
| conditions.regex.flags | `string` | <p>The regex flags</p> |
| actions | `string[]` | <p>Array containing what action is taken when the rule is matched</p>_Allowed values: "reject","ban","edit","delete"_ |
| options | `object` | <p>Contains settings related to the action that is taken</p> |
| options.ban_interval | `number` | <p>How many days to ban the user for, leave blank for permanent ban</p> |
| options.edit | `object` | <p>Contains information for replacing matched rule text</p> |
| options.edit.replace | `object` | <p>Contains info for what text to replace</p> |
| options.edit.replace.regex | `object` | <p>Regex to match text to replace</p> |
| options.edit.replace.regex.pattern | `string` | <p>The regex pattern</p> |
| options.edit.replace.regex.flags | `string` | <p>The regex flags</p> |
| options.edit.replace.text | `string` | <p>The text to replaced the matched text with</p> |
| options.edit.template | `string` | <p>Allows message to be replaced, prepended, or appended to</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the auto moderation rule</p> |
| name | `string` | <p>The name of the auto moderation rule</p> |
| description | `string` | <p>The description of what the rule does</p> |
| message | `string` | <p>The error message which is returned to the user</p> |
| conditions | `object[]` | <p>What conditions trigger the rule</p> |
| conditions.params | `string` | <p>The parameter that triggers the rule</p>_Allowed values: "body","thread_id","user_id","title"_ |
| conditions.regex | `object` | <p>A regex used to capture user input and trigger rule</p> |
| conditions.regex.pattern | `string` | <p>The regex pattern</p> |
| conditions.regex.flags | `string` | <p>The regex flags</p> |
| actions | `string[]` | <p>Array containing what action is taken when the rule is matched</p>_Allowed values: "reject","ban","edit","delete"_ |
| options | `object` | <p>Contains settings related to the action that is taken</p> |
| options.ban_interval | `number` | <p>How many days to ban the user for, leave blank for permanent ban</p> |
| options.edit | `object` | <p>Contains information for replacing matched rule text</p> |
| options.edit.replace | `object` | <p>Contains info for what text to replace</p> |
| options.edit.replace.regex | `object` | <p>Regex to match text to replace</p> |
| options.edit.replace.regex.pattern | `string` | <p>The regex pattern</p> |
| options.edit.replace.regex.flags | `string` | <p>The regex flags</p> |
| options.edit.replace.text | `string` | <p>The text to replaced the matched text with</p> |
| options.edit.template | `string` | <p>Allows message to be replaced, prepended, or appended to</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error creating the auto moderation rule</p> |

## <a name='Edit-Rule'></a> Edit Rule
[Back to top](#top)

<p>Used to edit an existing auto moderation rule</p>

```
PUT /automoderation/rules
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the auto moderation rule</p> |

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| name | `string` | <p>The name of the auto moderation rule</p> |
| description | `string` | <p>The description of what the rule does</p> |
| message | `string` | <p>The error message which is returned to the user</p> |
| conditions | `object[]` | <p>What conditions trigger the rule</p> |
| conditions.params | `string` | <p>The parameter that triggers the rule</p>_Allowed values: "body","thread_id","user_id","title"_ |
| conditions.regex | `object` | <p>A regex used to capture user input and trigger rule</p> |
| conditions.regex.pattern | `string` | <p>The regex pattern</p> |
| conditions.regex.flags | `string` | <p>The regex flags</p> |
| actions | `string[]` | <p>Array containing what action is taken when the rule is matched</p>_Allowed values: "reject","ban","edit","delete"_ |
| options | `object` | <p>Contains settings related to the action that is taken</p> |
| options.ban_interval | `number` | <p>How many days to ban the user for, leave blank for permanent ban</p> |
| options.edit | `object` | <p>Contains information for replacing matched rule text</p> |
| options.edit.replace | `object` | <p>Contains info for what text to replace</p> |
| options.edit.replace.regex | `object` | <p>Regex to match text to replace</p> |
| options.edit.replace.regex.pattern | `string` | <p>The regex pattern</p> |
| options.edit.replace.regex.flags | `string` | <p>The regex flags</p> |
| options.edit.replace.text | `string` | <p>The text to replaced the matched text with</p> |
| options.edit.template | `string` | <p>Allows message to be replaced, prepended, or appended to</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the auto moderation rule</p> |
| name | `string` | <p>The name of the auto moderation rule</p> |
| description | `string` | <p>The description of what the rule does</p> |
| message | `string` | <p>The error message which is returned to the user</p> |
| conditions | `object[]` | <p>What conditions trigger the rule</p> |
| conditions.params | `string` | <p>The parameter that triggers the rule</p>_Allowed values: "body","thread_id","user_id","title"_ |
| conditions.regex | `object` | <p>A regex used to capture user input and trigger rule</p> |
| conditions.regex.pattern | `string` | <p>The regex pattern</p> |
| conditions.regex.flags | `string` | <p>The regex flags</p> |
| actions | `string[]` | <p>Array containing what action is taken when the rule is matched</p>_Allowed values: "reject","ban","edit","delete"_ |
| options | `object` | <p>Contains settings related to the action that is taken</p> |
| options.ban_interval | `number` | <p>How many days to ban the user for, leave blank for permanent ban</p> |
| options.edit | `object` | <p>Contains information for replacing matched rule text</p> |
| options.edit.replace | `object` | <p>Contains info for what text to replace</p> |
| options.edit.replace.regex | `object` | <p>Regex to match text to replace</p> |
| options.edit.replace.regex.pattern | `string` | <p>The regex pattern</p> |
| options.edit.replace.regex.flags | `string` | <p>The regex flags</p> |
| options.edit.replace.text | `string` | <p>The text to replaced the matched text with</p> |
| options.edit.template | `string` | <p>Allows message to be replaced, prepended, or appended to</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error editing the auto moderation rule</p> |

## <a name='Remove-Rule'></a> Remove Rule
[Back to top](#top)

<p>Used to remove an existing auto moderation rule</p>

```
DELETE /automoderation/rules/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the rule to remove</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| HTTP | `object` | <p>Code STATUS 200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error removing the auto moderation rule</p> |

## <a name='View-Rules'></a> View Rules
[Back to top](#top)

<p>Returns auto moderation rules</p>

```
GET /automoderation/rules
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| rules | `object[]` | <p>An array of auto moderation rules</p> |
| rules.id | `string` | <p>The id of the auto moderation rule</p> |
| rules.name | `string` | <p>The name of the auto moderation rule</p> |
| rules.description | `string` | <p>The description of what the rule does</p> |
| rules.message | `string` | <p>The error message which is returned to the user</p> |
| rules.conditions | `object[]` | <p>What conditions trigger the rule</p> |
| rules.conditions.params | `string` | <p>The parameter that triggers the rule</p>_Allowed values: "body","thread_id","user_id","title"_ |
| rules.conditions.regex | `object` | <p>A regex used to capture user input and trigger rule</p> |
| rules.conditions.regex.pattern | `string` | <p>The regex pattern</p> |
| rules.conditions.regex.flags | `string` | <p>The regex flags</p> |
| rules.actions | `string[]` | <p>Array containing what action is taken when the rule is matched</p>_Allowed values: "reject","ban","edit","delete"_ |
| rules.options | `object` | <p>Contains settings related to the action that is taken</p> |
| rules.options.ban_interval | `number` | <p>How many days to ban the user for, leave blank for permanent ban</p> |
| rules.options.edit | `object` | <p>Contains information for replacing matched rule text</p> |
| rules.options.edit.replace | `object` | <p>Contains info for what text to replace</p> |
| rules.options.edit.replace.regex | `object` | <p>Regex to match text to replace</p> |
| rules.options.edit.replace.regex.pattern | `string` | <p>The regex pattern</p> |
| rules.options.edit.replace.regex.flags | `string` | <p>The regex flags</p> |
| rules.options.edit.replace.text | `string` | <p>The text to replaced the matched text with</p> |
| rules.options.edit.template | `string` | <p>Allows message to be replaced, prepended, or appended to</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error viewing the auto moderation rules</p> |

# <a name='Bans'></a> Bans

## <a name='(Admin)-Add-Ban-Addresses'></a> (Admin) Add Ban Addresses
[Back to top](#top)

<p>This allows Administrators to ban hostnames and addresses. When a user registers from a banned address, their account is automatically banned</p>

```
POST /ban/addresses
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object[]` | <p>An array of addresses to ban</p> |
| data.hostname | `string` | <p>The hostname to ban. If hostname is present IP should not be</p> |
| data.ip | `string` | <p>The IP address to ban. If IP is present hostname should not be</p> |
| data.decay | `boolean` | <p>Boolean indicating if the weight decays or not</p> |
| data.weight | `number` | <p>The weight of the address</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object[]` | <p>An array of banned addresses</p> |
| data.hostname | `string` | <p>The banned hostname</p> |
| data.ip | `string` | <p>The banned IP address</p> |
| data.decay | `boolean` | <p>Boolean indicating if the weight decays or not</p> |
| data.weight | `number` | <p>The weight of the address</p> |
| data.created_at | `string` | <p>The created_at date of the banned address</p> |
| data.updates | `string[]` | <p>An array of dates when the banned address was updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error banning the addresses</p> |

## <a name='(Admin)-Ban'></a> (Admin) Ban
[Back to top](#top)

<p>This allows Administrators and Moderators to ban users.</p>

```
PUT /users/ban
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The unique id of the user to ban</p> |
| expiration | `timestamp` | **optional** <p>The expiration date for the ban, when not defined ban is considered permanent</p> |
| ip_ban | `boolean` | **optional** <p>Boolean indicating that the user should be ip banned as well, this will make it so they cannot register from any of their known ips for a new account</p>_Default value: false_<br>_Allowed values: false_ |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the row in users.bans</p> |
| user_id | `string` | <p>The unique id of the user being banned</p> |
| roles | `object[]` | <p>Array containing users roles</p> |
| expiration | `timestamp` | <p>Timestamp of when the user's ban expires</p> |
| created_at | `timestamp` | <p>Timestamp of when the ban was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the ban was last updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error banning the user</p> |

## <a name='(Admin)-Ban-From-Boards'></a> (Admin) Ban From Boards
[Back to top](#top)

<p>This allows Administrators and Moderators to ban users from boards.</p>

```
PUT /users/ban/board
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The unique id of the user to ban from boards</p> |
| board_ids | `string[]` | <p>Array of board ids to ban the user from</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The unique id of the user being banned from boards</p> |
| board_ids | `string[]` | <p>Array of board ids to ban the user from</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error banning the user from Boards</p> |

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User tried to ban from a board they do not moderate, or tried to ban a user with higher permissions than themselves</p> |

## <a name='(Admin)-Delete-Ban-Address'></a> (Admin) Delete Ban Address
[Back to top](#top)

<p>This allows Administrators to delete banned hostnames and addresses.</p>

```
DELETE /ban/addresses
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| hostname | `string` | <p>The hostname to delete. If hostname is present IP should not be.</p> |
| ip | `string` | <p>The IP address to delete. If IP is present hostname should not be.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| hostname | `string` | <p>The deleted banned hostname</p> |
| ip | `string` | <p>The deleted banned IP address</p> |
| decay | `boolean` | <p>The deleted boolean indicating if the weight decays or not</p> |
| weight | `number` | <p>The deleted weight of the address</p> |
| created_at | `string` | <p>The created_at date of the deleted banned address</p> |
| updates | `string[]` | <p>An array of dates when the deleted banned address was updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error deleting the banned address</p> |

## <a name='(Admin)-Edit-Ban-Address'></a> (Admin) Edit Ban Address
[Back to top](#top)

<p>This allows Administrators to edit banned hostnames and addresses.</p>

```
PUT /ban/addresses
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| hostname | `string` | <p>The hostname to update. If hostname is present IP should not be.</p> |
| ip | `string` | <p>The IP address to update. If IP is present hostname should not be.</p> |
| decay | `boolean` | <p>The updated boolean indicating if the weight decays or not.</p> |
| weight | `number` | <p>The updated weight of the address</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| hostname | `string` | <p>The updated banned hostname</p> |
| ip | `string` | <p>The updated banned IP address</p> |
| decay | `boolean` | <p>The updated boolean indicating if the weight decays or not</p> |
| weight | `number` | <p>The updated weight of the address</p> |
| created_at | `string` | <p>The created_at date of the banned address</p> |
| updates | `string[]` | <p>An array of dates when the banned address was updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error updating the banned address</p> |

## <a name='(Admin)-Get-User&#39;s-Banned-Boards'></a> (Admin) Get User&#39;s Banned Boards
[Back to top](#top)

<p>This allows Administrators and Moderators to retrieve a list of boards that a user has been banned from.</p>

```
GET /users/:username/bannedboards
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The username of the user to get banned boards for</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| banned_boards | `object[]` | <p>An array of boards that the user is banned from</p> |
| banned_boards.id | `string` | <p>The id of the board the user is banned from</p> |
| banned_boards.name | `string` | <p>The name of the board the user is banned from</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error retrieving the user's banned boards</p> |

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User doesn't have permission to query for user's banned boards</p> |

## <a name='(Admin)-Page-by-Banned-Addresses'></a> (Admin) Page by Banned Addresses
[Back to top](#top)

<p>This allows Administrators to page through banned addresses.</p>

```
GET /ban/addresses
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of results to return</p>_Default value: 1_<br>_Size range: 1..n_<br> |
| limit | `number` | **optional** <p>The number of results per page to return</p>_Default value: 25_<br>_Size range: 1..100_<br> |
| search | `string` | **optional** <p>hostname or IP address to search for</p> |
| desc | `boolean` | **optional** <p>boolean indicating whether or not to sort results in descending order</p> |
| field | `string` | **optional** <p>sorts results by specified field</p>_Allowed values: "created_at","updates","decay","weight","update_count"_ |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The current page of results that is being returned</p> |
| limit | `number` | <p>The current number of results that is being returned per page</p> |
| next | `boolean` | <p>boolean indicating if there is a next page</p> |
| prev | `boolean` | <p>boolean indicating if there is a previous page</p> |
| search | `string` | <p>The search text that the results are being filtered by</p> |
| desc | `boolean` | <p>boolean indicating if the results are in descending order</p> |
| field | `string` | <p>field results are being sorted by</p> |
| data | `object[]` | <p>An array of banned addresses</p> |
| data.hostname | `string` | <p>The banned hostname</p> |
| data.ip | `string` | <p>The banned IP address</p> |
| data.decay | `boolean` | <p>Boolean indicating if the weight decays or not</p> |
| data.weight | `number` | <p>The weight of the address</p> |
| data.created_at | `string` | <p>The created_at date of the banned address</p> |
| data.updated_at | `string` | <p>The most reason updated date of the banned address</p> |
| data.updates | `string[]` | <p>An array of dates when the banned address was updated</p> |
| data.update_count | `number` | <p>The number of times the banned address has been updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error paging banned addresses</p> |

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User doesn't have permission to query banned addresses</p> |

## <a name='(Admin)-Page-by-Banned-Boards'></a> (Admin) Page by Banned Boards
[Back to top](#top)

<p>This allows Administrators and Moderators to page through users who have been banned from boards.</p>

```
GET /users/banned
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of results to return</p>_Default value: 1_<br>_Size range: 1..n_<br> |
| limit | `number` | **optional** <p>The number of results per page to return</p>_Default value: 25_<br>_Size range: 1..100_<br> |
| search | `string` | **optional** <p>username, email, or user id to filter results by</p> |
| board | `string` | **optional** <p>board id to filter results by</p> |
| modded | `boolean` | **optional** <p>booolean which indicates to only retun users who were banned from boards in which the logged in user moderates</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The current page of results that is being returned</p> |
| limit | `number` | <p>The current number of results that is being returned per page</p> |
| next | `boolean` | <p>boolean indicating if there is a next page</p> |
| prev | `boolean` | <p>boolean indicating if there is a previous page</p> |
| search | `string` | <p>The search text that the results are being filtered by</p> |
| board | `string` | <p>The board id that the results are being filtered by</p> |
| modded | `boolean` | <p>boolean indicating that the results being returned are within the users moderated boards</p> |
| data | `object[]` | <p>An array of board banned users and board data</p> |
| data.username | `string` | <p>The username of the board banned user</p> |
| data.user_id | `string` | <p>The id of the board banned user</p> |
| data.email | `string` | <p>The email of the board banned user</p> |
| data.created_at | `string` | <p>The created_at date of the board banned user's account</p> |
| data.board_ids | `string[]` | <p>An array of the board ids this user is banned from</p> |
| data.board_names | `string[]` | <p>An array of the board names this user is banned from</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error paging board banned users</p> |

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User doesn't have permission to query board banned users</p> |

## <a name='(Admin)-Unban'></a> (Admin) Unban
[Back to top](#top)

<p>This allows Administrators and Moderators to unban users. Ban expiration is set to current timestamp, expiring it immediately</p>

```
PUT /users/unban
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The unique id of the user to unban</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the row in users.bans</p> |
| user_id | `string` | <p>The unique id of the user being unbanned</p> |
| roles | `object[]` | <p>Array containing users roles</p> |
| expiration | `timestamp` | <p>Timestamp of when the user's ban expires (current timestamp)</p> |
| created_at | `timestamp` | <p>Timestamp of when the ban was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the ban was last updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error unbanning the user</p> |

## <a name='(Admin)-Unban-From-Boards'></a> (Admin) Unban From Boards
[Back to top](#top)

<p>This allows Administrators and Moderators to unban users from boards.</p>

```
PUT /users/unban/board
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The unique id of the user to unban from boards</p> |
| board_ids | `string[]` | <p>Array of board ids to unban the user from</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The unique id of the user being unbanned from boards</p> |
| board_ids | `string[]` | <p>Array of board ids to unban the user from</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error unbanning the user from Boards</p> |

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User tried to unban from a board they do not moderate, or tried to unban a user with higher permissions than themselves</p> |

# <a name='Boards'></a> Boards

## <a name='All-Boards'></a> All Boards
[Back to top](#top)

<p>Used to find all boards.</p>

```
GET /boards/uncategorized
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| boards | `object[]` | <p>Array containing all of the forums boards</p> |
| boards.id | `string` | <p>The board's unique id</p> |
| boards.name | `string` | <p>The board's name</p> |
| boards.description | `string` | <p>The board's description</p> |
| boards.viewable_by | `number` | <p>Minimum priority a user must have to view the board, null if no restriction</p> |
| boards.postable_by | `number` | <p>Minimum priority a user must have to post in the board, null if no restriction</p> |
| boards.created_at | `timestamp` | <p>Created at date for board</p> |
| boards.updated_at | `timestamp` | <p>Last time the board was updated</p> |
| boards.imported_at | `timestamp` | <p>If the board was imported at, the</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue finding all boards</p> |

## <a name='Create'></a> Create
[Back to top](#top)

<p>Used to create a new board</p>

```
POST /boards
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| boards | `object[]` | <p>Array containing the boards to create</p> |
| name | `string` | <p>The name for the board</p>_Size range: 1..255_<br> |
| description | `string` | **optional** <p>The description text for the board</p>_Size range: 0..255_<br> |
| viewable_by | `number` | **optional** <p>The minimum priority required to view the board, null for no restriction</p> |
| postable_by | `number` | **optional** <p>The minimum priority required to post in the board, null for no restriction</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The board's unique id</p> |
| name | `string` | <p>The board's name</p> |
| description | `string` | <p>The boards description</p> |
| viewable_by | `number` | <p>The minimum priority required to view the board, null for no restriction</p> |
| postable_by | `number` | <p>The minimum priority required to post in the board, null for no restriction</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue creating the board</p> |

## <a name='Delete'></a> Delete
[Back to top](#top)

<p>Used to delete an existing board from the forum.</p>

```
DELETE /boards/:id
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| board_ids | `string[]` | <p>An array of board ids to delete</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| boards | `object[]` | <p>An array of the deleted boards</p> |
| id | `string` | <p>The id of the deleted board</p> |
| name | `string` | <p>The name of the deleted board</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue deleting the boards</p> |

## <a name='Find-Board'></a> Find Board
[Back to top](#top)

<p>Used to lookup a board</p>

```
GET /boards/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the board to lookup</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the board</p> |
| name | `string` | <p>The name of the board</p> |
| parent_id | `string` | <p>The id of the parent board if applicable</p> |
| viewable_by | `number` | <p>The minimum priority to be able to view the board, null for no restriction</p> |
| postable_by | `number` | <p>The minimum priority to be able to post to the board, null for no restriction</p> |
| description | `string` | <p>The board description text</p> |
| thread_count | `number` | <p>The number of threads within the board</p> |
| post_count | `number` | <p>The number of posts within the board</p> |
| children | `object[]` | <p>An array containing child boards if applicable</p> |
| moderators | `object[]` | <p>Array containing data about the moderators of the board</p> |
| moderators.id | `string` | <p>The id of the moderator</p> |
| moderators.username | `string` | <p>The username of the moderator</p> |
| created_at | `timestamp` | <p>The created at timestamp of the board</p> |
| updated_at | `timestamp` | <p>The updated at timestamp of the board</p> |
| imported_at | `timestamp` | <p>The imported at timestamp of the board</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue finding the board</p> |

## <a name='Move-Boards'></a> Move Boards
[Back to top](#top)

<p>Used to find all possible boards to move a thread to.</p>

```
GET /boards/move
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| boards | `object[]` | <p>Array containing all of the forums boards</p> |
| boards.parent_id | `string` | <p>The board's parent board or category id</p> |
| boards.parent_name | `string` | <p>The board's parent board or category name</p> |
| boards.id | `string` | <p>The board's unique id</p> |
| boards.name | `string` | <p>The board's name</p> |
| boards.view_order | `number` | <p>The view order of the board</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue finding all boards</p> |

## <a name='Update'></a> Update
[Back to top](#top)

<p>Used to update an existing information for boards</p>

```
POST /boards/:id
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| boards | `object[]` | <p>Array containing the boards to create</p> |
| id | `string` | <p>The board id</p> |
| name | `string` | <p>The name for the board</p>_Size range: 1..255_<br> |
| description | `string` | <p>The description text for the board</p>_Size range: 0..255_<br> |
| viewable_by | `number` | <p>The minimum priority required to view the board, null for no restriction</p> |
| postable_by | `number` | <p>The minimum priority required to post in the board, null for no restriction</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The board's unique id</p> |
| name | `string` | <p>The board's name</p> |
| description | `string` | <p>The boards description</p> |
| viewable_by | `number` | <p>The minimum priority required to view the board, null for no restriction</p> |
| postable_by | `number` | <p>The minimum priority required to post in the board, null for no restriction</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue updating the boards</p> |

## <a name='Update-All-Boards-Categorized'></a> Update All Boards Categorized
[Back to top](#top)

<p>Used to update all boards within their categories.</p>

```
POST /boards/all
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| boardMapping | `object[]` | <p>Array containing mapping of boards and categories</p> |
| boardMapping.id | `string` | <p>The id of the category or board</p> |
| boardMapping.name | `string` | <p>The name of the category or board</p> |
| boardMapping.type | `string` | <p>The type of the mapping object</p>_Allowed values: "board","category","uncategorized"_ |
| boardMapping.view_order | `number` | <p>The view order of the board or category</p> |
| boardMapping.category_id | `string` | **optional** <p>If type is &quot;board&quot; the id of the category the board belongs to</p> |
| boardMapping.parent_id | `string` | **optional** <p>If type is &quot;board&quot; and the board is a child board, the id of the parent board</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| operations | `array` | <p>Array containing all of the operations performed while updating categories</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue updating categories/boards</p> |

# <a name='Breadcrumbs'></a> Breadcrumbs

## <a name='Find'></a> Find
[Back to top](#top)

<p>Used to get the breadcrumbs from board, thread, category or post id</p>

```
GET /breadcrumbs
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the board, thread, category or post to retrieve breadcrumbs for</p> |
| type | `string` | <p>The type of the id being provided (board, category, thread, or post)</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| breadcrumbs | `object[]` | <p>Array containing breadcrumb objects</p> |
| breadcrumbs.label | `string` | <p>Label for the breadcrumb link</p> |
| breadcrumbs.state | `string` | <p>State for backing the label</p> |
| breadcrumbs.opts | `object` | <p>State options to pass to ui-sref, can include id or hash</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the breadcrumbs</p> |

# <a name='Categories'></a> Categories

## <a name='All-Categories-(Filters-Private)'></a> All Categories (Filters Private)
[Back to top](#top)

<p>Used to retrieve all boards within their respective categories.</p>

```
GET /boards
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of threads to bring back for recent threads</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of threads to bring back per page for recent threads</p>_Default value: 25_<br>_Size range: 1..100_<br> |
| stripped | `boolean` | **optional** <p>If true brings back boards with no additional metadata</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| data | `object` | <p>Object containing boards and recent thread data</p> |
| data.boards | `object[]` | <p>contains boards in their respective categories</p> |
| data.boards.id | `string` | <p>The id of the category</p> |
| data.boards.name | `string` | <p>The name of the category</p> |
| data.boards.view_order | `number` | <p>The view order of the category</p> |
| data.boards.viewable_by | `number` | <p>The minimum priority to be able to view category, null for no restriction</p> |
| data.boards.postable_by | `number` | <p>The minimum priority to be able to post in category, null for no restriction</p> |
| data.boards.imported_at | `timestamp` | <p>If the category was imported, the import timestamp</p> |
| data.boards.boards | `object[]` | <p>Array containing boards nested within category</p> |
| data.boards.boards.id | `string` | <p>The id of the board</p> |
| data.boards.boards.name | `string` | <p>The name of the board</p> |
| data.boards.boards.category_id | `string` | <p>The id of the category containing the board</p> |
| data.boards.boards.parent_id | `string` | <p>The id of the parent board if applicable</p> |
| data.boards.boards.view_order | `number` | <p>The view order of the board</p> |
| data.boards.boards.viewable_by | `number` | <p>The minimum priority to be able to view the board, null for no restriction</p> |
| data.boards.boards.postable_by | `number` | <p>The minimum priority to be able to post to the board, null for no restriction (stripped=false)</p> |
| data.boards.boards.description | `string` | <p>The board description text(stripped=false)</p> |
| data.boards.boards.thread_count | `number` | <p>The number of threads within the board (stripped=false)</p> |
| data.boards.boards.post_count | `number` | <p>The number of posts within the board(stripped=false)</p> |
| data.boards.boards.last_thread_id | `string` | <p>The id of the last posted in thread (stripped=false)</p> |
| data.boards.boards.last_thread_title | `string` | <p>The title of the last posted in thread (stripped=false)</p> |
| data.boards.boards.post_deleted | `boolean` | <p>Boolean indicating if the last post in the board was deleted (stripped=false)</p> |
| data.boards.boards.last_post_postion | `number` | <p>The position of the last post within a thread in the board (stripped=false)</p> |
| data.boards.boards.last_post_created_at | `timestamp` | <p>The created at timestamp of the most recent post (stripped=false)</p> |
| data.boards.boards.last_post_username | `string` | <p>The username of the user who created the most recent post (stripped=false)</p> |
| data.boards.boards.last_post_avatar | `string` | <p>The avatar of the user who created the most recent post (stripped=false)</p> |
| data.boards.boards.user_id | `string` | <p>The id of the user who created the most recent post (stripped=false)</p> |
| data.boards.boards.user_deleted | `boolean` | <p>Boolean indicating if the user who created the most recent post has had their account deleted (stripped=false)</p> |
| data.boards.boards.children | `object[]` | <p>An array containing child boards if applicable</p> |
| data.boards.boards.moderators | `object[]` | <p>Array containing data about the moderators of the board (stripped=false)</p> |
| data.boards.boards.moderators.id | `string` | <p>The id of the moderator</p> |
| data.boards.boards.moderators.username | `string` | <p>The username of the moderator</p> |
| data.boards.boards.created_at | `timestamp` | <p>The created at timestamp of the board(stripped=false)</p> |
| data.boards.boards.updated_at | `timestamp` | <p>The updated at timestamp of the board(stripped=false)</p> |
| data.boards.boards.imported_at | `timestamp` | <p>The imported at timestamp of the board(stripped=false)</p> |
| data.threads | `object[]` | <p>contains threads with most recent posts (stripped=false)</p> |
| data.threads.id | `string` | <p>The id of the thread</p> |
| data.threads.locked | `boolean` | <p>Boolean indicating if the thread is locked</p> |
| data.threads.sticky | `boolean` | <p>Boolean indicating if the thread is stickied</p> |
| data.threads.moderated | `boolean` | <p>Boolean indicating if the thread is self moderated</p> |
| data.threads.poll | `boolean` | <p>Boolean indicating if the thread has a poll</p> |
| data.threads.updated_at | `timestamp` | <p>updated at timestamp of the thread</p> |
| data.threads.view_count | `number` | <p>View count of the thread</p> |
| data.threads.title | `string` | <p>The title of the thread</p> |
| data.threads.board | `object` | <p>The board the thread is in</p> |
| data.threads.board.id | `string` | <p>The id of the board</p> |
| data.threads.board.name | `string` | <p>The name of the board</p> |
| data.threads.post | `object` | <p>The post object for the thread</p> |
| data.threads.post.id | `string` | <p>The id of the post</p> |
| data.threads.post.position | `number` | <p>The position of the last post</p> |
| data.threads.post.created_at | `timestamp` | <p>The created at timestamp of the post</p> |
| data.threads.post.deleted | `boolean` | <p>Boolean indicating if the post was deleted</p> |
| data.threads.user | `object` | <p>The user who created the post</p> |
| data.threads.user.id | `string` | <p>The id of the user who created the last post</p> |
| data.threads.user.username | `string` | <p>The username of the user who created the last post</p> |
| data.threads.user.deleted | `boolean` | <p>Boolean indicating if the user who created the last post had their account deleted</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving boards</p> |

## <a name='All-Categories-(Includes-Private)'></a> All Categories (Includes Private)
[Back to top](#top)

<p>Used to retrieve all boards within their respective categories not filtering private boards.</p>

```
GET /boards/unfiltered
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| categories | `object[]` | <p>An array containing categories and all their boards</p> |
| categories.id | `string` | <p>The categories unique id</p> |
| categories.name | `string` | <p>The categories name</p> |
| categories.view_order | `number` | <p>The categories view order</p> |
| categories.imported_at | `timestamp` | <p>If the category was imported, the import date</p> |
| categories.viewable_by | `number` | <p>Minimum priority a user must have to view the category, null if no restriction</p> |
| categories.postable_by | `number` | <p>Minimum priority a user must have to post in boards within this category, null if no restriction</p> |
| categories.boards | `object[]` | <p>Array of boards within this category</p> |
| categories.boards.id | `string` | <p>The board's unique id</p> |
| categories.boards.name | `string` | <p>The board's name</p> |
| categories.boards.description | `string` | <p>The board's description</p> |
| categories.boards.viewable_by | `number` | <p>Minimum priority a user must have to view the board, null if no restriction</p> |
| categories.boards.postable_by | `number` | <p>Minimum priority a user must have to post in the board, null if no restriction</p> |
| categories.boards.thread_count | `number` | <p>Number of threads in the board</p> |
| categories.boards.post_count | `number` | <p>Number of posts in the board</p> |
| categories.boards.created_at | `timestamp` | <p>Created at date for board</p> |
| categories.boards.updated_at | `timestamp` | <p>Last time the board was updated</p> |
| categories.boards.imported_at | `timestamp` | <p>If the board was imported at, the time it was imported</p> |
| categories.boards.last_thread_id | `string` | <p>The id of the thread last posted in</p> |
| categories.boards.parent_id | `string` | <p>If the board is a child board the parent board's id</p> |
| categories.boards.category_id | `string` | <p>The id of the board's parent category</p> |
| categories.boards.view_order | `number` | <p>The view order of the board</p> |
| categories.boards.last_thread_title | `string` | <p>The title of the thread last posted in</p> |
| categories.boards.post_deleted | `boolean` | <p>Indicates if the last post in the board was deleted</p> |
| categories.boards.last_post_created_at | `timestamp` | <p>Timestamp of the last post in the board's created date</p> |
| categories.boards.last_post_position | `number` | <p>The position of the last post within the thread</p> |
| categories.boards.last_post_username | `string` | <p>The username of the author of the last post within the board</p> |
| categories.boards.last_post_avatar | `string` | <p>The avatar of the author of the last post within the board</p> |
| categories.boards.user_id | `string` | <p>The id of the author of the last post within the board</p> |
| categories.boards.user_deleted | `boolean` | <p>Boolean which indicates if the last user to post within the board has had their account deleted</p> |
| categories.boards.moderators | `object[]` | <p>Array of boards moderators</p> |
| categories.boards.moderators.id | `string` | <p>The id of the moderator</p> |
| categories.boards.moderators.username | `string` | <p>The username of the moderator</p> |
| categories.boards.children | `object[]` | <p>Array of child boards of this board</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving categories</p> |

## <a name='Create-Categories'></a> Create Categories
[Back to top](#top)

<p>Used to create categories</p>

```
POST /categories
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| categories | `string[]` | <p>Array of category names</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| categories | `object[]` | <p>Array of created category</p> |
| categories.id | `string` | <p>The id of the newly created category</p> |
| categories.name | `string` | <p>The name of the newly created category</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue creating the categories</p> |

## <a name='Delete-Categories'></a> Delete Categories
[Back to top](#top)

<p>Used to delete categories</p>

```
POST /categories/delete
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| category_ids | `string[]` | <p>Array of category ids to delete</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| category_ids | `string[]` | <p>Array of deleted category ids</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue deleting the categories</p> |

# <a name='Conversations'></a> Conversations

## <a name='Create'></a> Create
[Back to top](#top)

<p>Used to create a new conversation and the first message of the conversation.</p>

```
POST /conversations
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| receiver_ids | `string` | <p>The id of the users receiving the message/conversation</p> |
| content | `object` | <p>The contents of this message</p> |
| content.body | `string` | <p>The raw contents of this message</p> |
| content.body_html | `string` | <p>The html contents of this message</p> |
| content.subject | `string` | <p>The subject of this message</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the message</p> |
| conversation_id | `string` | <p>The unique id of the conversation this message belongs to</p> |
| sender_id | `string` | <p>The unique id of the user that sent this message</p> |
| receiver_ids | `string` | <p>The unique ids of the users that will receive this message</p> |
| content | `object` | <p>The contents of this message</p> |
| content.body | `string` | <p>The raw contents of this message</p> |
| content.body_html | `string` | <p>The html contents of this message</p> |
| content.subject | `string` | <p>The subject of this message</p> |
| created_at | `timestamp` | <p>Timestamp of when the conversation was created</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue creating the conversation</p> |

## <a name='Delete'></a> Delete
[Back to top](#top)

<p>Used to delete a conversation.</p>

```
DELETE /conversations/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The Id of the conversation to delete</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the conversation being deleted</p> |
| sender_id | `string` | <p>The unique id of the sender</p> |
| receiver_ids | `string` | <p>The unique ids of the receivers</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue deleting the conversation</p> |

## <a name='Messages-in-Conversation'></a> Messages in Conversation
[Back to top](#top)

<p>Used to get messages for this conversation.</p>

```
GET /conversations/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the conversation to get</p> |

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| timestamp | `timestamp` | **optional** <p>The timestamp to look for messages before</p> |
| message_id | `string` | **optional** <p>The id of the last message</p> |
| limit | `number` | **optional** <p>How many messages to return per page</p>_Default value: 15_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the conversation</p> |
| has_next | `boolean` | <p>Boolean indicating if there are more messages</p> |
| last_message_timestamp | `timestamp` | <p>timestamp of the last message</p> |
| last_message_id | `timestamp` | <p>timestamp of the last message</p> |
| subject | `string` | <p>The subject of the conversation</p> |
| messages | `object[]` | <p>An array of messages in this conversation</p> |
| messages.id | `string` | <p>The unique id of the message</p> |
| messages.conversation_id | `string` | <p>The unique id of the conversation this message belongs to</p> |
| messages.sender_id | `string` | <p>The unique id of the user that sent this message</p> |
| messages.receiver_id | `string` | <p>The unique id of the user that sent this message</p> |
| messages.body | `string` | <p>The contents of this message</p> |
| messages.viewed | `boolean` | <p>The flag showing if the receiver viewed this message</p> |
| messages.created_at | `timestamp` | <p>Timestamp of when the conversation was created</p> |
| messages.sender_username | `string` | <p>The username of the sender</p> |
| messages.sender_deleted | `boolean` | <p>Boolean indicating if the sender's account is deleted</p> |
| messages.sender_avatar | `string` | <p>The avatar of the sender</p> |
| messages.receiver_username | `string` | <p>The username of the receiver</p> |
| messages.receiver_deleted | `boolean` | <p>Boolean indicating if the receiver's account is deleted</p> |
| messages.receiver_avatar | `string` | <p>The avatar of the receiver</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue getting messages for this conversation</p> |

# <a name='Legal'></a> Legal

## <a name='(Admin)-Reset-Legal-Text'></a> (Admin) Reset Legal Text
[Back to top](#top)

<p>Used to reset legal text to default text</p>

```
POST /api/legal/reset
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| tos | `string` | <p>The source html for the terms of service page</p> |
| privacy | `string` | <p>The source html for the privacy page</p> |
| disclaimer | `string` | <p>The source html for the disclaimer page</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the ToS, privacy policy and disclaimer.</p> |

## <a name='(Admin)-Text'></a> (Admin) Text
[Back to top](#top)

<p>Used to fetch the ToS, privacy policy and disclaimer to be updated by the user.</p>

```
GET /api/legal
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| tos | `string` | <p>The source html for the terms of service page</p> |
| privacy | `string` | <p>The source html for the privacy page</p> |
| disclaimer | `string` | <p>The source html for the disclaimer page</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the ToS, privacy policy and disclaimer.</p> |

## <a name='(Admin)-Update'></a> (Admin) Update
[Back to top](#top)

<p>Used to update all legal text: ToS, privacy policy, disclaimers.</p>

```
PUT /api/legal
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| tos | `string` | **optional** <p>The updated Terms of Service.</p> |
| privacy | `string` | **optional** <p>The updated privacy policy.</p> |
| disclaimer | `string` | **optional** <p>The updated disclaimer.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| success | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the ToS, privacy policy and disclaimer.</p> |

# <a name='Mentions'></a> Mentions

## <a name='Delete-Mentions'></a> Delete Mentions
[Back to top](#top)

<p>Used to delete a user's mentions</p>

```
DELETE /mentions
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the mention to delete</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| deleted | `boolean` | <p>True if the mention was deleted</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue deleting the mention</p> |

## <a name='Get-Mention-Settings'></a> Get Mention Settings
[Back to top](#top)

<p>Used to retreive the user's mention settings</p>

```
GET /mentions/settings
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| email_mentions | `boolean` | <p>Boolean indicating if the user is receiving emails when mentioned</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an getting mention settings</p> |

## <a name='Ignore-User&#39;s-Mentions'></a> Ignore User&#39;s Mentions
[Back to top](#top)

<p>Used to ignore mentions from a specific user's</p>

```
POST /mentions/ignore
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The name of the user to ignore mentions from</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| success | `boolean` | <p>True if the user was ignored</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue ignoring mentions</p> |

## <a name='Page-Ignored-Users'></a> Page Ignored Users
[Back to top](#top)

<p>Used to page through user's whos mentions are being ignored</p>

```
GET /mentions/ignored
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of ignored users to return</p> |
| limit | `number` | **optional** <p>The number ignored users to return per page</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The page of ignored users being returned</p> |
| limit | `number` | <p>The number ignored users being returned per page</p> |
| prev | `boolean` | <p>Boolean indicating if there is a previous page</p> |
| next | `boolean` | <p>Boolean indicating if there is a next page</p> |
| data | `object[]` | <p>Array containing ignored users</p> |
| data.username | `string` | <p>The name of the user being ignored</p> |
| data.id | `string` | <p>The id of the user being ignored</p> |
| data.avatar | `string` | <p>The avatar of the user being ignored</p> |
| data.ignored | `boolean` | <p>Boolean indicating if the user's mentions are being ignored</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error paging ignored users</p> |

## <a name='Remove-Thread-Subscriptions'></a> Remove Thread Subscriptions
[Back to top](#top)

<p>Used to delete a user's thread subscriptions</p>

```
DELETE /threadnotifications
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| deleted | `boolean` | <p>True if the user's thread subscriptions were deleted</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue deleting the user's thread subscriptions</p> |

## <a name='Toggle-Mention-Emails'></a> Toggle Mention Emails
[Back to top](#top)

<p>Used to toggle email notifications when mentioned</p>

```
PUT /mentions/settings
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| enabled | `boolean` | **optional** <p>Boolean indicating if mention emails are enabled or not</p>_Default value: true_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| enabled | `boolean` | <p>Boolean indicating if the mention emails were enabled or not</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an enabling mention emails</p> |

## <a name='Unignore-User&#39;s-Mentions'></a> Unignore User&#39;s Mentions
[Back to top](#top)

<p>Used to unignore mentions from a specific user's</p>

```
POST /mentions/unignore
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The name of the user to unignore mentions from</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| success | `boolean` | <p>True if the user was unignored</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue unignoring mentions</p> |

## <a name='View-Mentions'></a> View Mentions
[Back to top](#top)

<p>Used to view a user's mentions</p>

```
GET /mentions
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of mentions to return</p> |
| limit | `number` | **optional** <p>The number mentions to return per page</p> |
| extended | `boolean` | **optional** <p>Brings back extra data such as parts of the post body, board name, board id, etc...</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The page of mentions being returned</p> |
| limit | `number` | <p>The number mentions being returned per page</p> |
| prev | `boolean` | <p>Boolean indicating if there is a previous page</p> |
| next | `boolean` | <p>Boolean indicating if there is a next page</p> |
| extended | `boolean` | <p>Boolean indicating if extra metadata should be returned</p> |
| data | `object[]` | <p>Array containing mention objects</p> |
| data.id | `string` | <p>The id of the mention</p> |
| data.thread_id | `string` | <p>The id of the thread the mention is in</p> |
| data.title | `string` | <p>The title of the thread the mention is in</p> |
| data.post_id | `string` | <p>The id of the post the mention is in</p> |
| data.post_start | `number` | <p>The start position of the post in the thread</p> |
| data.mentioner | `string` | <p>The username of the mentioner</p> |
| data.mentioner_avatar | `string` | <p>The avatar of the mentioner</p> |
| data.notification_id | `string` | <p>The id of the notification (for websockets)</p> |
| data.viewed | `boolean` | <p>Boolean indicating if the mention has been viewed</p> |
| data.created_at | `timestamp` | <p>Timestamp of when the mention was created</p> |
| data.board_id | `string` | <p>The id of the board the mention is in (If extended=true)</p> |
| data.board_name | `string` | <p>The name of the board the mentions is in(If extended=true)</p> |
| data.body_html | `string` | <p>The body of the post the mention is in (If extended=true)</p> |
| data.body | `string` | <p>The unprocess body of the post the mention is in (If extended=true)</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error paging user mentions</p> |

# <a name='Messages'></a> Messages

## <a name='Create'></a> Create
[Back to top](#top)

<p>Used to create a new message.</p>

```
POST /messages
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| conversation_id | `string` | <p>The id of the conversation the message should be created in</p> |
| receiver_ids | `string` | <p>The ids of the users receiving the message/conversation</p> |
| content | `object` | <p>The contents of this message</p> |
| content.body | `string` | <p>The raw contents of this message</p> |
| content.body_html | `string` | <p>The html contents of this message</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the message</p> |
| conversation_id | `string` | <p>The unique id of the conversation this message belongs to</p> |
| sender_id | `string` | <p>The unique id of the user that sent this message</p> |
| receiver_ids | `string` | <p>The unique ids of the users that will receive this message</p> |
| content | `object` | <p>The contents of this message</p> |
| content.body | `string` | <p>The raw contents of this message</p> |
| content.body_html | `string` | <p>The html contents of this message</p> |
| content.subject | `string` | <p>The subject of this message</p> |
| created_at | `timestamp` | <p>Timestamp of when the conversation was created</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue creating the message</p> |

## <a name='Delete'></a> Delete
[Back to top](#top)

<p>Used to delete a message.</p>

```
DELETE /messages/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The Id of the message to delete</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the message being deleted</p> |
| sender_id | `string` | <p>The unique id of the user that sent this message</p> |
| receiver_ids | `string` | <p>The unique ids of the users that were sent this message</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue deleting the message</p> |

## <a name='Get-Messages-Settings'></a> Get Messages Settings
[Back to top](#top)

<p>Used to retreive the user's message settings</p>

```
GET /messages/settings
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| email_messages | `boolean` | <p>Boolean indicating if the user is receiving emails when messaged</p> |
| ignore_newbies | `boolean` | <p>Boolean indicating if the user allows newbies to send them messages</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an getting message settings</p> |

## <a name='Get-Recent-Messages'></a> Get Recent Messages
[Back to top](#top)

<p>Get the latest messages for this user.</p>

```
GET /messages
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of messages to return</p> |
| limit | `number` | **optional** <p>The number of messages per page</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| updated_at | `timestamp` | <p>Timestamp of the last message received</p> |
| sender_username | `string` | <p>The username of the sender</p> |
| sender_deleted | `boolean` | <p>Boolean indicating if the sender's account is deleted</p> |
| sender_avatar | `string` | <p>The avatar of the sender</p> |
| receiver_username | `string` | <p>The username of the receiver</p> |
| receiver_deleted | `boolean` | <p>Boolean indicating if the receiver's account is deleted</p> |
| receiver_avatar | `string` | <p>The avatar of the receiver</p> |
| id | `string` | <p>The unique id of the message</p> |
| conversation_id | `string` | <p>The unique id of the conversation this message belongs to</p> |
| sender_id | `string` | <p>The unique id of the user that sent this message</p> |
| receiver_ids | `string` | <p>The unique ids of the users that will receive this message</p> |
| content | `object` | <p>The contents of this message</p> |
| content.body | `string` | <p>The raw contents of this message</p> |
| content.body_html | `string` | <p>The html contents of this message</p> |
| content.subject | `string` | <p>The subject of this message</p> |
| created_at | `timestamp` | <p>Timestamp of when the conversation was created</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue getting the messages</p> |

## <a name='Ignore-User&#39;s-Messages'></a> Ignore User&#39;s Messages
[Back to top](#top)

<p>Used to ignore messages from a specific user</p>

```
POST /messages/ignore
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The name of the user to ignore messages from</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| success | `boolean` | <p>True if the user was ignored</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue ignoring messages</p> |

## <a name='Page-Ignored-Users'></a> Page Ignored Users
[Back to top](#top)

<p>Used to page through user's whos messages are being ignored</p>

```
GET /messages/ignored
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of ignored users to return</p> |
| limit | `number` | **optional** <p>The number ignored users to return per page</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The page of ignored users being returned</p> |
| limit | `number` | <p>The number ignored users being returned per page</p> |
| prev | `boolean` | <p>Boolean indicating if there is a previous page</p> |
| next | `boolean` | <p>Boolean indicating if there is a next page</p> |
| data | `object[]` | <p>Array containing ignored users</p> |
| data.username | `string` | <p>The name of the user being ignored</p> |
| data.id | `string` | <p>The id of the user being ignored</p> |
| data.avatar | `string` | <p>The avatar of the user being ignored</p> |
| data.ignored | `boolean` | <p>Boolean indicating if the user's messages are being ignored</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error paging ignored users</p> |

## <a name='Toggle-Message-Emails'></a> Toggle Message Emails
[Back to top](#top)

<p>Used to toggle email notifications when messaged</p>

```
PUT /messages/settings
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| enabled | `boolean` | **optional** <p>Boolean indicating if message emails are enabled or not</p>_Default value: true_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| enabled | `boolean` | <p>Boolean indicating if the message emails were enabled or not</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an enabling message emails</p> |

## <a name='Toggle-Newbie-Messages'></a> Toggle Newbie Messages
[Back to top](#top)

<p>Used to toggle setting allowing messages from users with the newbie role</p>

```
PUT /messages/settings/newbie
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| enabled | `boolean` | **optional** <p>Boolean indicating if message emails are enabled or not</p>_Default value: true_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| enabled | `boolean` | <p>Boolean indicating if the newbie messages are enabled or not</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error toggling newbie message settings</p> |

## <a name='Unignore-User&#39;s-Messages'></a> Unignore User&#39;s Messages
[Back to top](#top)

<p>Used to unignore messages from a specific user's</p>

```
POST /messages/unignore
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The name of the user to unignore messages from</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| success | `boolean` | <p>True if the user was unignored</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue unignoring messages</p> |

# <a name='Moderation'></a> Moderation

## <a name='(Admin)-Page-Moderation-Log'></a> (Admin) Page Moderation Log
[Back to top](#top)

<p>This allows Administrators to page through all actions performed by moderators.</p>

```
GET /admin/modlog
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of moderation logs to retrieve</p>_Default value: 1_<br>_Size range: 1..n_<br> |
| limit | `number` | **optional** <p>The number of logs to retrieve per page</p>_Default value: 25_<br>_Size range: 1..n_<br> |
| mod | `string` | **optional** <p>The username of the moderator to search logs for</p> |
| action | `action` | **optional** <p>The action to search for, follows route permission conventions (e.g. posts.create, posts.update, etc...)</p> |
| keyword | `string` | **optional** <p>Keywords to search log for</p> |
| bdate | `timestamp` | **optional** <p>Used to search for logs before specific date</p> |
| adate | `timestamp` | **optional** <p>Used to search for logs after specific date</p> |
| sdate | `timestamp` | **optional** <p>Used to search for logs between specific date (start)</p> |
| edate | `timestamp` | **optional** <p>Used to search for logs between specific date (end)</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The current page of moderation logs being returned</p> |
| limit | `number` | <p>The number of logs being returned per page</p> |
| next | `number` | <p>The page number of the next page</p> |
| prev | `number` | <p>The page number of the previous page</p> |
| data | `object[]` | <p>Array containing moderation logs</p> |
| mod_username | `string` | <p>The username of the mod who performed the action</p> |
| mod_id | `string` | <p>The id of the mod who performed the action</p> |
| mod_ip | `string` | <p>The ip address of the mod who performed the action</p> |
| action_api_url | `string` | <p>The route that the moderator used to perform action</p> |
| action_api_method | `string` | <p>The route method type (e.g. PUT, GET, etc..)</p> |
| action_api_obj | `object` | <p>Metadata which was saved to the log when the action was performed</p> |
| action_taken_at | `timestamp` | <p>Timestamp of when the action was performed</p> |
| action_type | `string` | <p>The type of action that was performed, follows route permission conventions (e.g. posts.create, posts.update, etc...)</p> |
| action_display_text | `string` | <p>Text describing what action was taken</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error retrieving the moderation logs</p> |

# <a name='Moderators'></a> Moderators

## <a name='Add-Moderator'></a> Add Moderator
[Back to top](#top)

<p>Add a moderator to a board.</p>

```
POST /admin/moderators
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| usernames | `string[]` | <p>Array of usernames to add as a moderator.</p> |
| board_id | `string` | <p>The id of the board to add the moderator to.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| moderators | `object[]` | <p>Array of users who were added as moderators</p> |
| moderators.id | `string` | <p>The unique id of the moderator</p> |
| moderators.username | `string` | <p>The username of the moderator</p> |
| moderators.roles | `object[]` | <p>Array of the users roles, including new moderator role</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue adding the moderator.</p> |

## <a name='Remove-Moderator'></a> Remove Moderator
[Back to top](#top)

<p>Remove a moderator from a board.</p>

```
POST /admin/moderators/remove
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string[]` | <p>Array of user ids of the user to remove from being a moderator.</p> |
| board_id | `string` | <p>The id of the board to remove the moderator from.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| moderators | `object[]` | <p>Array of users who were removed from list of moderators</p> |
| moderators.id | `string` | <p>The unique id of the moderator</p> |
| moderators.username | `string` | <p>The username of the moderator</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue removing the moderator.</p> |

# <a name='MOTD'></a> MOTD

## <a name='Get-Message-of-the-Day'></a> Get Message of the Day
[Back to top](#top)

<p>Used to retrieve the message of the day</p>

```
GET /motd
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| motd | `string` | <p>The unparsed motd, may contain bbcode or markdown</p> |
| motd_html | `string` | <p>The parsed motd html to display to users</p> |
| main_view_only | `boolean` | <p>Lets the UI know to display on the main page or all pages</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the Message of the Day</p> |

## <a name='Set-Message-of-the-Day'></a> Set Message of the Day
[Back to top](#top)

<p>Used to set the message of the day</p>

```
PUT /motd
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| motd | `string` | <p>The unparse message of the day, may contain markdown or bbcode</p> |
| main_view_only | `boolean` | <p>Lets the UI know to display on the main page or all pages</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| motd | `string` | <p>The unparsed motd, may contain bbcode or markdown</p> |
| motd_html | `string` | <p>The parsed motd html to display to users</p> |
| main_view_only | `boolean` | <p>Lets the UI know to display on the main page or all pages</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue saving the Message of the Day</p> |

# <a name='Notifications'></a> Notifications

## <a name='Dismiss'></a> Dismiss
[Back to top](#top)

<p>Used to dismiss all notifications of a type.</p>

```
POST /notifications
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| type | `string` | <p>The type of notifications to dismiss</p>_Allowed values: "message","mention","other"_ |
| id | `string` | <p>The id of the specific notification to dismiss</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| STATUS | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue dismissing the notifications</p> |

## <a name='Get-Notifications-counts'></a> Get Notifications counts
[Back to top](#top)

<p>Get the notifications counts for this user.</p>

```
GET /notifications/counts
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| notificationsCounts | `object` | <p>Object containing notification count information</p> |
| notificationsCounts.message | `number` | <p>Number of message notifications</p> |
| notificationsCounts.mention | `number` | <p>Number of mention notifications</p> |
| notificationsCounts.other | `number` | <p>Number of other notifications</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue getting the notifications counts</p> |

# <a name='Portal'></a> Portal

## <a name='Portal-Contents'></a> Portal Contents
[Back to top](#top)

<p>Used to retrieve the portal contents.</p>

```
GET /portal
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| boards | `object[]` | <p>contains boards to be displayed in portal</p> |
| boards.id | `string` | <p>The id of the board</p> |
| boards.name | `string` | <p>The name of the board</p> |
| boards.parent_id | `string` | <p>The id of the parent board if applicable</p> |
| boards.viewable_by | `number` | <p>The minimum priority to be able to view the board, null for no restriction</p> |
| boards.postable_by | `number` | <p>The minimum priority to be able to post to the board, null for no restriction (stripped=false)</p> |
| boards.description | `string` | <p>The board description text(stripped=false)</p> |
| boards.thread_count | `number` | <p>The number of threads within the board (stripped=false)</p> |
| boards.post_count | `number` | <p>The number of posts within the board(stripped=false)</p> |
| boards.moderators | `object[]` | <p>Array containing data about the moderators of the board (stripped=false)</p> |
| boards.moderators.id | `string` | <p>The id of the moderator</p> |
| boards.moderators.username | `string` | <p>The username of the moderator</p> |
| boards.created_at | `timestamp` | <p>The created at timestamp of the board(stripped=false)</p> |
| boards.updated_at | `timestamp` | <p>The updated at timestamp of the board(stripped=false)</p> |
| boards.imported_at | `timestamp` | <p>The imported at timestamp of the board(stripped=false)</p> |
| threads | `object[]` | <p>contains threads with most recent posts (stripped=false)</p> |
| threads.id | `string` | <p>The id of the thread</p> |
| threads.locked | `boolean` | <p>Boolean indicating if the thread is locked</p> |
| threads.sticky | `boolean` | <p>Boolean indicating if the thread is stickied</p> |
| threads.moderated | `boolean` | <p>Boolean indicating if the thread is self moderated</p> |
| threads.poll | `boolean` | <p>Boolean indicating if the thread has a poll</p> |
| threads.updated_at | `timestamp` | <p>updated at timestamp of the thread</p> |
| threads.view_count | `number` | <p>View count of the thread</p> |
| threads.title | `string` | <p>The title of the thread</p> |
| threads.last_post_id | `string` | <p>The id of the last post</p> |
| threads.last_post_position | `number` | <p>The position of the last post</p> |
| threads.last_post_created_at | `timestamp` | <p>Created at timestamp of last post</p> |
| threads.last_post_updated_at | `timestamp` | <p>Updated at timestamp of last post</p> |
| threads.post_body | `string` | <p>The body of the post</p> |
| threads.post_avatar | `string` | <p>The avatar of the user who made the last post</p> |
| threads.post_signature | `string` | <p>The signature of the user who made the last post</p> |
| threads.post_user_name | `string` | <p>the name of the user who made the last post</p> |
| threads.post_highlight_color | `string` | <p>The highlight color of the user who made the last post</p> |
| threads.post_role_name | `string` | <p>The role of the user who made the last post</p> |
| threads.last_post_username | `string` | <p>The username of the user who made the last post</p> |
| threads.user | `object` | <p>The user who created the post</p> |
| threads.user.id | `string` | <p>The id of the user who created the last post</p> |
| threads.user.username | `string` | <p>The username of the user who created the last post</p> |
| threads.user.deleted | `boolean` | <p>Boolean indicating if the user who created the last post had their account deleted</p> |
| recent | `object[]` | <p>contains threads with most recent posts (stripped=false)</p> |
| recent.id | `string` | <p>The id of the thread</p> |
| recent.locked | `boolean` | <p>Boolean indicating if the thread is locked</p> |
| recent.sticky | `boolean` | <p>Boolean indicating if the thread is stickied</p> |
| recent.moderated | `boolean` | <p>Boolean indicating if the thread is self moderated</p> |
| recent.poll | `boolean` | <p>Boolean indicating if the thread has a poll</p> |
| recent.updated_at | `timestamp` | <p>updated at timestamp of the thread</p> |
| recent.view_count | `number` | <p>View count of the thread</p> |
| recent.title | `string` | <p>The title of the thread</p> |
| recent.board | `object` | <p>The board the thread is in</p> |
| recent.board.id | `string` | <p>The id of the board</p> |
| recent.board.name | `string` | <p>The name of the board</p> |
| recent.post | `object` | <p>The post object for the thread</p> |
| recent.post.id | `string` | <p>The id of the post</p> |
| recent.post.position | `number` | <p>The position of the last post</p> |
| recent.post.created_at | `timestamp` | <p>The created at timestamp of the post</p> |
| recent.post.deleted | `boolean` | <p>Boolean indicating if the post was deleted</p> |
| recent.user | `object` | <p>The user who created the post</p> |
| recent.user.id | `string` | <p>The id of the user who created the last post</p> |
| recent.user.username | `string` | <p>The username of the user who created the last post</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>Portal is disabled.</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving portal content.</p> |

# <a name='Posts'></a> Posts

## <a name='Create'></a> Create
[Back to top](#top)

<p>Used to create a new post.</p>

```
POST /posts
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| title | `string` | <p>The title of the post</p> |
| body | `string` | <p>The post's body as it was entered in the editor by the user</p> |
| thread_id | `string` | <p>The unique id of the thread the post belongs to</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the post</p> |
| thread_id | `string` | <p>The unique id of the thread the post belongs to</p> |
| user_id | `string` | <p>The unique id of the user who created the post</p> |
| title | `string` | <p>The title of the post</p> |
| body_html | `string` | <p>The post's body with any markup tags converted and parsed into html elements</p> |
| deleted | `boolean` | <p>boolean indicating if post has been deleted</p> |
| locked | `boolean` | <p>boolean indicating if post has been locked</p> |
| body | `string` | <p>The post's body as it was entered in the editor by the user</p> |
| created_at | `timestamp` | <p>Timestamp of when the post was created</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue creating the post</p> |

## <a name='Delete'></a> Delete
[Back to top](#top)

<p>Used to delete a post.</p>

```
DELETE /posts/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The Id of the post to delete</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| position | `number` | <p>The position of the post within the thread</p> |
| updated_at | `timestamp` | <p>The updated at timestamp of the post</p> |
| imported_at | `timestamp` | <p>The imported at timestamp of the post</p> |
| id | `string` | <p>The unique id of the post</p> |
| thread_id | `string` | <p>The unique id of the thread the post belongs to</p> |
| user_id | `string` | <p>The unique id of the user who created the post</p> |
| title | `string` | <p>The title of the post</p> |
| body_html | `string` | <p>The post's body with any markup tags converted and parsed into html elements</p> |
| deleted | `boolean` | <p>boolean indicating if post has been deleted</p> |
| locked | `boolean` | <p>boolean indicating if post has been locked</p> |
| body | `string` | <p>The post's body as it was entered in the editor by the user</p> |
| created_at | `timestamp` | <p>Timestamp of when the post was created</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue deleting the post</p> |

## <a name='Find'></a> Find
[Back to top](#top)

<p>Used to find a post.</p>

```
GET /posts/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the post to retrieve</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| avatar | `string` | <p>The avatar of the post author</p> |
| position | `number` | <p>The position of the post within the thread</p> |
| updated_at | `timestamp` | <p>The updated at timestamp of the post</p> |
| imported_at | `timestamp` | <p>The imported at timestamp of the post</p> |
| user | `object` | <p>Object containing user data about the author of the post</p> |
| user.id | `string` | <p>The id of the user</p> |
| user.name | `string` | <p>The name of the user</p> |
| user.username | `string` | <p>The username of the user</p> |
| user.signature | `string` | <p>The signature of the user</p> |
| id | `string` | <p>The unique id of the post</p> |
| thread_id | `string` | <p>The unique id of the thread the post belongs to</p> |
| user_id | `string` | <p>The unique id of the user who created the post</p> |
| title | `string` | <p>The title of the post</p> |
| body_html | `string` | <p>The post's body with any markup tags converted and parsed into html elements</p> |
| deleted | `boolean` | <p>boolean indicating if post has been deleted</p> |
| locked | `boolean` | <p>boolean indicating if post has been locked</p> |
| body | `string` | <p>The post's body as it was entered in the editor by the user</p> |
| created_at | `timestamp` | <p>Timestamp of when the post was created</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue finding the post</p> |

## <a name='Lock'></a> Lock
[Back to top](#top)

<p>Used to lock a post.</p>

```
POST /posts/:id/lock
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The Id of the post to lock</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| position | `number` | <p>The position of the post within the thread</p> |
| updated_at | `timestamp` | <p>The updated at timestamp of the post</p> |
| imported_at | `timestamp` | <p>The imported at timestamp of the post</p> |
| id | `string` | <p>The unique id of the post</p> |
| thread_id | `string` | <p>The unique id of the thread the post belongs to</p> |
| user_id | `string` | <p>The unique id of the user who created the post</p> |
| title | `string` | <p>The title of the post</p> |
| body_html | `string` | <p>The post's body with any markup tags converted and parsed into html elements</p> |
| deleted | `boolean` | <p>boolean indicating if post has been deleted</p> |
| locked | `boolean` | <p>boolean indicating if post has been locked</p> |
| body | `string` | <p>The post's body as it was entered in the editor by the user</p> |
| created_at | `timestamp` | <p>Timestamp of when the post was created</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>Post Not Found</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue deleting the post</p> |

## <a name='Page-By-Thread'></a> Page By Thread
[Back to top](#top)

<p>Used to page through posts by thread.</p>

```
GET /posts
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| thread_id | `string` | <p>Id of the thread to retrieve posts from</p> |
| page | `number` | <p>Specific page of posts to retrieve. Only valid when start param is not present.</p> |
| limit | `number` | <p>Number of posts to retrieve per page.</p> |
| start | `number` | <p>Specific post within the thread. Only valid when page param is not present.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| write_access | `boolean` | <p>Boolean indicating if user has write access to thread</p> |
| banned_from_board | `boolean` | <p>Boolean indicating if user is banned from this board</p> |
| page | `number` | <p>The page of posts being returned</p> |
| limit | `number` | <p>The number of posts per page being returned</p> |
| thread | `object` | <p>Object containing thread metadata</p> |
| thread.id | `string` | <p>The id of the thread</p> |
| thread.board_id | `string` | <p>The id of the board the thread is in</p> |
| thread.locked | `boolean` | <p>Boolean indicating if thread is locked</p> |
| thread.sticky | `boolean` | <p>Boolean indicating if thread is stickied</p> |
| thread.moderated | `boolean` | <p>Boolean indicating if thread is self moderated</p> |
| thread.watched | `boolean` | <p>Boolean indicating if thread is being watched</p> |
| thread.trust_visible | `boolean` | <p>Boolean indicating if trust score is visible</p> |
| thread.post_count | `number` | <p>Number of posts in the thread</p> |
| thread.created_at | `timestamp` | <p>Thread created at timestamp</p> |
| thread.updated_at | `timestamp` | <p>Thread updated at timestamp</p> |
| thread.user | `object` | <p>The user who started the thread</p> |
| thread.user.id | `string` | <p>The id of the user who started the thread</p> |
| thread.user.username | `string` | <p>The username of the user who started the thread</p> |
| thread.user.deleted | `boolean` | <p>Boolean indicating if the thread started has had their account deleted</p> |
| thread.poll | `object` | <p>Object that contains poll data, if thread has a poll</p> |
| thread.poll.id | `string` | <p>The unique id of the poll</p> |
| thread.poll.question | `string` | <p>The question asked in the poll</p> |
| thread.poll.answers | `object[]` | <p>The list of the answers to the question of this poll</p> |
| thread.poll.answers.answer | `string` | <p>The answer to the question of this poll</p> |
| thread.poll.max_answers | `number` | <p>The max number of answer per vote</p> |
| thread.poll.change_vote | `boolean` | <p>Boolean indicating whether users can change their vote</p> |
| thread.poll.locked | `boolean` | <p>Boolean indicating whether the poll is locked or not</p> |
| thread.poll.has_voted | `boolean` | <p>Boolean indicating whether or not the user has voted</p> |
| thread.poll.expiration | `date` | <p>The expiration date of the poll</p> |
| thread.poll.display_mode | `string` | <p>String indicating how the results are shown to users</p> |
| board | `object` | <p>Object containing information about the board the post is in</p> |
| board.id | `string` | <p>The id of the board</p> |
| board.name | `string` | <p>The name of the board</p> |
| board.parent_id | `string` | <p>The id of the parent board if applicable</p> |
| board.watched | `boolean` | <p>Boolean indicating if the authed user is watching this board</p> |
| board.viewable_by | `number` | <p>The minimum priority to be able to view the board, null for no restriction</p> |
| board.postable_by | `number` | <p>The minimum priority to be able to post to the board, null for no restriction</p> |
| board.description | `string` | <p>The board description text</p> |
| board.thread_count | `number` | <p>The number of threads within the board</p> |
| board.post_count | `number` | <p>The number of posts within the board</p> |
| board.children | `object[]` | <p>An array containing child boards if applicable</p> |
| board.moderators | `object[]` | <p>Array containing data about the moderators of the board</p> |
| board.moderators.id | `string` | <p>The id of the moderator</p> |
| board.moderators.username | `string` | <p>The username of the moderator</p> |
| board.created_at | `timestamp` | <p>The created at timestamp of the board</p> |
| board.updated_at | `timestamp` | <p>The updated at timestamp of the board</p> |
| board.imported_at | `timestamp` | <p>The imported at timestamp of the board</p> |
| posts | `object[]` | <p>Object containing thread posts</p> |
| posts.id | `string` | <p>The id of the post</p> |
| posts.position | `number` | <p>The position of the post in the thread</p> |
| posts.thread_id | `string` | <p>The id of the thread containing the post</p> |
| posts.board_id | `string` | <p>The id of the board containing the post</p> |
| posts.title | `string` | <p>The title of the post</p> |
| posts.body_html | `string` | <p>The processed body of the post</p> |
| posts.body | `string` | <p>The unprocessed body of the post</p> |
| posts.locked | `boolean` | <p>Boolean indicating if the thread is locked</p> |
| posts.reported | `boolean` | <p>Boolean indicating if the post has been reported by the authorized user</p> |
| posts.reported_author | `boolean` | <p>Boolean indicating if the post's author has been reported by the authorized user</p> |
| posts.created_at | `timestamp` | <p>The created at timestamp of the post</p> |
| posts.updated_at | `timestamp` | <p>The updated at timestamp of the post</p> |
| posts.imported_at | `timestamp` | <p>The imported at timestamp of the post</p> |
| posts.avatar | `string` | <p>The avatar of the user who made the post</p> |
| posts.user | `object` | <p>Object containing user data about the author of the post</p> |
| posts.user.id | `string` | <p>The id of the user</p> |
| posts.user.name | `string` | <p>The name of the user</p> |
| posts.user.username | `string` | <p>The username of the user</p> |
| posts.user.priority | `number` | <p>The priority of the user</p> |
| posts.user.signature | `string` | <p>The signature of the user</p> |
| posts.user.highlight_color | `string` | <p>The role highlight color of the user</p> |
| posts.user.role_name | `string` | <p>The role name of the user</p> |
| posts.user.activity | `number` | <p>The user's activity number</p> |
| posts.user.post_count | `number` | <p>The user's post count number</p> |
| posts.user.stats | `object` | <p>Object containing trust stats for user</p> |
| posts.user.stats.score | `number` | <p>The user's overall trust score</p> |
| posts.user.stats.neg | `number` | <p>The user's negative trust points</p> |
| posts.user.stats.pos | `number` | <p>The user's positive trust points</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue finding the posts for thread</p> |

## <a name='Page-By-User'></a> Page By User
[Back to top](#top)

<p>Used to page through posts made by a particular user</p>

```
GET /posts/user/:username
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The username of the user's whose posts to page through</p> |

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>Which page of the user's posts to retrieve</p>_Default value: 1_<br>_Size range: 1..n_<br> |
| limit | `number` | **optional** <p>How many posts to return per page</p>_Default value: 25_<br>_Size range: 1..100_<br> |
| desc | `boolean` | **optional** <p>True to sort descending, false to sort ascending</p>_Default value: true_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The page of posts to return</p> |
| limit | `number` | <p>The number of posts to return per page</p> |
| desc | `boolean` | <p>Boolean indicating the sort order of the posts</p> |
| posts | `object[]` | <p>Object containing users posts</p> |
| posts.id | `string` | <p>The id of the post</p> |
| posts.thread_id | `string` | <p>The id of the thread containing the post</p> |
| posts.body | `string` | <p>The unprocessed body of the post</p> |
| posts.body_html | `string` | <p>The processed body of the post</p> |
| posts.position | `number` | <p>The position of the post in the thread</p> |
| posts.deleted | `boolean` | <p>Boolean indicating if the post is deleted</p> |
| posts.hidden | `boolean` | <p>Boolean indicating if the post is hidden (true if user is owner of deleted post)</p> |
| posts.created_at | `timestamp` | <p>The created at timestamp of the post</p> |
| posts.updated_at | `timestamp` | <p>The updated at timestamp of the post</p> |
| posts.imported_at | `timestamp` | <p>The imported at timestamp of the post</p> |
| posts.board_id | `string` | <p>The id of the board containing the post</p> |
| posts.thread_title | `string` | <p>The title of the thread the post is in</p> |
| posts.avatar | `string` | <p>The avatar of the user who made the post</p> |
| posts.user | `object` | <p>Object containing user data about the author of the post</p> |
| posts.user.id | `string` | <p>The id of the user</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue paging posts for user</p> |

## <a name='Page-First-Posts-By-User'></a> Page First Posts By User
[Back to top](#top)

<p>Used to page through starting posts made by a particular user</p>

```
GET /posts/user/:username/started
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The username of the user's whose posts to page through</p> |

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>Which page of the user's posts to retrieve</p>_Default value: 1_<br>_Size range: 1..n_<br> |
| limit | `number` | **optional** <p>How many posts to return per page</p>_Default value: 25_<br>_Size range: 1..100_<br> |
| desc | `boolean` | **optional** <p>True to sort descending, false to sort ascending</p>_Default value: true_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The page of posts to return</p> |
| limit | `number` | <p>The number of posts to return per page</p> |
| desc | `boolean` | <p>Boolean indicating the sort order of the posts</p> |
| posts | `object[]` | <p>Object containing users posts</p> |
| posts.id | `string` | <p>The id of the post</p> |
| posts.thread_id | `string` | <p>The id of the thread containing the post</p> |
| posts.body | `string` | <p>The unprocessed body of the post</p> |
| posts.body_html | `string` | <p>The processed body of the post</p> |
| posts.position | `number` | <p>The position of the post in the thread</p> |
| posts.deleted | `boolean` | <p>Boolean indicating if the post is deleted</p> |
| posts.hidden | `boolean` | <p>Boolean indicating if the post is hidden (true if user is owner of deleted post)</p> |
| posts.created_at | `timestamp` | <p>The created at timestamp of the post</p> |
| posts.updated_at | `timestamp` | <p>The updated at timestamp of the post</p> |
| posts.imported_at | `timestamp` | <p>The imported at timestamp of the post</p> |
| posts.board_id | `string` | <p>The id of the board containing the post</p> |
| posts.thread_title | `string` | <p>The title of the thread the post is in</p> |
| posts.avatar | `string` | <p>The avatar of the user who made the post</p> |
| posts.user | `object` | <p>Object containing user data about the author of the post</p> |
| posts.user.id | `string` | <p>The id of the user</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue paging posts for user</p> |

## <a name='Purge'></a> Purge
[Back to top](#top)

<p>Used to purge a post.</p>

```
DELETE /posts/:id/purge
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The Id of the post to purge</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The id of the user who created the post</p> |
| thread_id | `string` | <p>The id of the thread that the post belonged to</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue purging the post</p> |

## <a name='Search-Posts'></a> Search Posts
[Back to top](#top)

<p>This allows users to search forum posts.</p>

```
GET /search/posts
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of search results to retrieve</p>_Default value: 1_<br>_Size range: 1..n_<br> |
| limit | `number` | **optional** <p>The number of search results per page</p>_Default value: 25_<br>_Size range: 1..100_<br> |
| desc | `boolean` | **optional** <p>Boolean indicating whether or not to sort the results in descending order</p>_Default value: false_<br> |
| search | `string` | **optional** <p>The term to search posts for</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| limit | `number` | <p>The number of results returned per page</p> |
| page | `string` | <p>The current page of the results</p> |
| desc | `number` | <p>The order the results are sorted in</p> |
| search | `string` | <p>The search term used in query for posts</p> |
| next | `number` | <p>The number of the next page of search results</p> |
| prev | `number` | <p>The number of the previous page of search results</p> |
| posts | `object[]` | <p>An array of post objects</p> |
| posts.id | `string` | <p>The unique id of the post</p> |
| posts.thread_title | `string` | <p>The title of the thread the post belongs to</p> |
| posts.user_id | `string` | <p>The id of the author of the post</p> |
| posts.created_at | `timestamp` | <p>Timestamp of when the post was created</p> |
| posts.thread_id | `string` | <p>The id of the thread the post belongs to</p> |
| posts.position | `number` | <p>The position of the post within the thread</p> |
| posts.body | `string` | <p>The body of the post</p> |
| posts.board_id | `string` | <p>The id of the board the post belongs to</p> |
| posts.board_name | `string` | <p>The name of the board the post belongs to</p> |
| posts.user | `string` | <p>User object containing info about user who made post</p> |
| posts.user.username | `string` | <p>Username of the user who made the post</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error retrieving the users</p> |

## <a name='Undelete'></a> Undelete
[Back to top](#top)

<p>Used to undo a deleted post.</p>

```
POST /posts/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The Id of the post to undo deletion on</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| position | `number` | <p>The position of the post within the thread</p> |
| updated_at | `timestamp` | <p>The updated at timestamp of the post</p> |
| imported_at | `timestamp` | <p>The imported at timestamp of the post</p> |
| id | `string` | <p>The unique id of the post</p> |
| thread_id | `string` | <p>The unique id of the thread the post belongs to</p> |
| user_id | `string` | <p>The unique id of the user who created the post</p> |
| title | `string` | <p>The title of the post</p> |
| body_html | `string` | <p>The post's body with any markup tags converted and parsed into html elements</p> |
| deleted | `boolean` | <p>boolean indicating if post has been deleted</p> |
| locked | `boolean` | <p>boolean indicating if post has been locked</p> |
| body | `string` | <p>The post's body as it was entered in the editor by the user</p> |
| created_at | `timestamp` | <p>Timestamp of when the post was created</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue undeleting the post</p> |

## <a name='Unlock'></a> Unlock
[Back to top](#top)

<p>Used to unlock a post.</p>

```
POST /posts/:id/unlock
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The Id of the post to unlock</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| position | `number` | <p>The position of the post within the thread</p> |
| updated_at | `timestamp` | <p>The updated at timestamp of the post</p> |
| imported_at | `timestamp` | <p>The imported at timestamp of the post</p> |
| id | `string` | <p>The unique id of the post</p> |
| thread_id | `string` | <p>The unique id of the thread the post belongs to</p> |
| user_id | `string` | <p>The unique id of the user who created the post</p> |
| title | `string` | <p>The title of the post</p> |
| body_html | `string` | <p>The post's body with any markup tags converted and parsed into html elements</p> |
| deleted | `boolean` | <p>boolean indicating if post has been deleted</p> |
| locked | `boolean` | <p>boolean indicating if post has been locked</p> |
| body | `string` | <p>The post's body as it was entered in the editor by the user</p> |
| created_at | `timestamp` | <p>Timestamp of when the post was created</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>Post Not Found</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue deleting the post</p> |

## <a name='Update'></a> Update
[Back to top](#top)

<p>Used to update a post.</p>

```
POST /posts/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the post being updated</p> |

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| title | `string` | <p>The title of the post</p> |
| body | `string` | <p>The post's body as it was entered in the editor by the user</p> |
| thread_id | `string` | <p>The unique id of the thread the post belongs to</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the post</p> |
| thread_id | `string` | <p>The unique id of the thread the post belongs to</p> |
| user_id | `string` | <p>The unique id of the user who created the post</p> |
| title | `string` | <p>The title of the post</p> |
| body_html | `string` | <p>The post's body with any markup tags converted and parsed into html elements</p> |
| body | `string` | <p>The post's body as it was entered in the editor by the user</p> |
| updated_at | `timestamp` | <p>Timestamp of when the post was updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue updating the post</p> |

# <a name='Rank'></a> Rank

## <a name='Get-Ranks'></a> Get Ranks
[Back to top](#top)

<p>Used to retrieve a list of all ranks and their thresholds for use in the admin panel</p>

```
GET /rank
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| ranks | `object[]` | <p>The id of the rank to updated</p> |
| ranks.name | `string` | <p>The name of the rank</p> |
| ranks.post_count | `number` | <p>The post count needed to achieve the rank</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the list of ranks</p> |

## <a name='Upsert-Rank'></a> Upsert Rank
[Back to top](#top)

<p>Used to insert/update ranks</p>

```
PUT /rank
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| ranks | `object[]` | <p>The list of ranks to be updated</p> |
| ranks.name | `string` | <p>The name of the rank</p> |
| ranks.post_count | `number` | <p>The post count needed to achieve the rank</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| ranks | `object[]` | <p>The list of ranks which were updated</p> |
| ranks.name | `string` | <p>The name of the rank</p> |
| ranks.post_count | `number` | <p>The post count needed to achieve the rank</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue upserting the rank</p> |

# <a name='Reports'></a> Reports

## <a name='(Admin)-Create-Message-Report-Note'></a> (Admin) Create Message Report Note
[Back to top](#top)

<p>Used to leave a note on message moderation reports.</p>

```
POST /reports/messagenotes
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| report_id | `string` | <p>The id of the message report to leave the note on</p> |
| user_id | `string` | <p>The id of the message leaving the message report note</p> |
| note | `string` | <p>The note being left on the message report</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id for the message report note</p> |
| report_id | `string` | <p>The id of the message report to leave the note on</p> |
| user_id | `string` | <p>The id of the user leaving the message report note</p> |
| username | `string` | <p>The username of the user who left the message report note</p> |
| avatar | `string` | <p>The url to the avatar of the user who left the message report note</p> |
| note | `string` | <p>The note being left on the message report</p> |
| created_at | `timestamp` | <p>Timestamp of when the message report note was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the message report note was last updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error creating the message report note</p> |

## <a name='(Admin)-Create-Post-Report-Note'></a> (Admin) Create Post Report Note
[Back to top](#top)

<p>Used to leave a note on post moderation reports.</p>

```
POST /reports/postnotes
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| report_id | `string` | <p>The id of the post report to leave the note on</p> |
| user_id | `string` | <p>The id of the post leaving the post report note</p> |
| note | `string` | <p>The note being left on the post report</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id for the post report note</p> |
| report_id | `string` | <p>The id of the post report to leave the note on</p> |
| user_id | `string` | <p>The id of the user leaving the post report note</p> |
| username | `string` | <p>The username of the user who left the post report note</p> |
| avatar | `string` | <p>The url to the avatar of the user who left the post report note</p> |
| note | `string` | <p>The note being left on the post report</p> |
| created_at | `timestamp` | <p>Timestamp of when the post report note was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the post report note was last updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error creating the post report note</p> |

## <a name='(Admin)-Create-User-Report-Note'></a> (Admin) Create User Report Note
[Back to top](#top)

<p>Used to leave a note on user moderation reports.</p>

```
POST /reports/usernotes
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| report_id | `string` | <p>The id of the user report to leave the note on</p> |
| user_id | `string` | <p>The id of the user leaving the user report note</p> |
| note | `string` | <p>The note being left on the user report</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id for the user report note</p> |
| report_id | `string` | <p>The id of the user report to leave the note on</p> |
| user_id | `string` | <p>The id of the user leaving the user report note</p> |
| username | `string` | <p>The username of the user who left the user report note</p> |
| avatar | `string` | <p>The url to the avatar of the user who left the user report note</p> |
| note | `string` | <p>The note being left on the user report</p> |
| created_at | `timestamp` | <p>Timestamp of when the user report note was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the user report note was last updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error creating the user report note</p> |

## <a name='(Admin)-Page-Message-Report'></a> (Admin) Page Message Report
[Back to top](#top)

<p>Used to page through message moderation reports.</p>

```
GET /reports/messages
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of message reports to retrieve</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of message reports to retrieve per page</p>_Default value: 15_<br> |
| filter | `string` | **optional** <p>Used to filter reports by their status</p>_Allowed values: "Pending","Reviwed","Ignored","Bad Report"_ |
| field | `string` | **optional** <p>Indicates which column to sort by, used for table sorting</p>_Default value: created_at_<br>_Allowed values: "created_at","priority","reporter_username","offender_created_at","offender_author_username"_ |
| desc | `boolean` | **optional** <p>Boolean indicating whether or not to sort the results in descending order</p>_Default value: false_<br> |
| search | `string` | **optional** <p>String used to search for a report by username</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| count | `number` | <p>The total number of reports</p> |
| limit | `number` | <p>The number of reports to bring back per page</p> |
| page | `number` | <p>The current page of reports brought back</p> |
| page_count | `number` | <p>The total number of pages</p> |
| filter | `string` | <p>Indicates the status type of the report being brought back</p> |
| field | `string` | <p>Indicates the field the reports are sorted by</p> |
| search | `string` | <p>Indicates the search string</p> |
| desc | `boolean` | <p>Boolean indicating if the results are in descending order</p> |
| data | `object[]` | <p>An array of message reports. Sort order varies depending on the query parameters passed in.</p> |
| data.id | `string` | <p>The unique id of the message report</p> |
| data.status | `string` | <p>The status of the message report</p> |
| data.reviewer_user_id | `string` | <p>The unique id of the user who reviewed the message report</p> |
| data.offender_ban_expiration | `timestamp` | <p>If the user is banned, the expiration of their ban</p> |
| data.offender_board_banned | `boolean` | <p>Boolean indicating if user is board banned</p> |
| data.offender_message_id | `string` | <p>The unique id of the offending message</p> |
| data.offender_message | `string` | <p>The body of the offending message</p> |
| data.offender_created_at | `timestamp` | <p>Timestamp of the offending message was created</p> |
| data.offender_author_created_at | `timestamp` | <p>Timestamp of the offending message's author created date</p> |
| data.offender_author_username | `string` | <p>The username of the offending message's author</p> |
| data.offender_author_email | `string` | <p>The email of the user who created the offending message</p> |
| data.offender_author_id | `string` | <p>The unique id of the offending message's author</p> |
| data.reporter_reason | `string` | <p>The reason for the report</p> |
| data.reporter_user_id | `string` | <p>The unique id of the reporting user</p> |
| data.reporter_username | `string` | <p>The username of the reporting user</p> |
| data.created_at | `timestamp` | <p>Timestamp of when the message report was created</p> |
| data.updated_at | `timestamp` | <p>Timestamp of when the message report was last updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error retrieving the message reports</p> |

## <a name='(Admin)-Page-Message-Report-Notes'></a> (Admin) Page Message Report Notes
[Back to top](#top)

<p>Used to page through message moderation report notes.</p>

```
GET /reports/messagenotes/:messageReportId
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| messageReportId | `string` | <p>The unique id of the message report to retrieve notes for</p> |

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of message report notes to retrieve</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of message report notes to retrieve per page</p>_Default value: 10_<br> |
| desc | `boolean` | **optional** <p>Boolean indicating whether or not to sort the results in descending order</p>_Default value: true_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| count | `number` | <p>The total number of report notes</p> |
| limit | `number` | <p>The number of report notes to bring back per page</p> |
| page | `number` | <p>The current page of report notes brought back</p> |
| page_count | `number` | <p>The total number of pages</p> |
| desc | `boolean` | <p>Boolean indicating if the results are in descending order</p> |
| data | `object[]` | <p>An array of message report note objects.</p> |
| data.id | `string` | <p>The unique id of the message report note</p> |
| data.report_id | `string` | <p>The unique id of the message report this note is for</p> |
| data.user_id | `string` | <p>The unique id of the user who left the note</p> |
| data.username | `string` | <p>The username of the user who left the note</p> |
| data.avatar | `string` | <p>The URL to the avatar of the user who left the note</p> |
| data.note | `string` | <p>The note message that was left on the report</p> |
| data.created_at | `timestamp` | <p>Timestamp of when the report note was created</p> |
| data.updated_at | `timestamp` | <p>Timestamp of when the report note was last updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error retrieving the message report notes</p> |

## <a name='(Admin)-Page-Post-Report'></a> (Admin) Page Post Report
[Back to top](#top)

<p>Used to page through post moderation reports.</p>

```
GET /reports/posts
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of post reports to retrieve</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of post reports to retrieve per page</p>_Default value: 15_<br> |
| filter | `string` | **optional** <p>Used to filter reports by their status</p>_Allowed values: "Pending","Reviwed","Ignored","Bad Report"_ |
| field | `string` | **optional** <p>Indicates which column to sort by, used for table sorting</p>_Default value: created_at_<br>_Allowed values: "created_at","priority","reporter_username","offender_created_at","offender_title","offender_author_username"_ |
| desc | `boolean` | **optional** <p>Boolean indicating whether or not to sort the results in descending order</p>_Default value: false_<br> |
| search | `string` | **optional** <p>String used to search for a report by username</p> |
| mod_id | `string` | **optional** <p>If moderators user id is passed in, only returns reports made in boards this user moderates</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| count | `number` | <p>The total number of reports</p> |
| limit | `number` | <p>The number of reports to bring back per page</p> |
| page | `number` | <p>The current page of reports brought back</p> |
| page_count | `number` | <p>The total number of pages</p> |
| filter | `string` | <p>Indicates the status type of the report being brought back</p> |
| field | `string` | <p>Indicates the field the reports are sorted by</p> |
| search | `string` | <p>Indicates the search string</p> |
| desc | `boolean` | <p>Boolean indicating if the results are in descending order</p> |
| data | `object[]` | <p>An array of post reports. Sort order varies depending on the query parameters passed in.</p> |
| data.id | `string` | <p>The unique id of the post report</p> |
| data.status | `string` | <p>The status of the post report</p> |
| data.reviewer_user_id | `string` | <p>The unique id of the user who reviewed the post report</p> |
| data.offender_ban_expiration | `timestamp` | <p>If the user is banned, the expiration of their ban</p> |
| data.offender_board_banned | `boolean` | <p>Boolean indicating if user is board banned</p> |
| data.offender_post_id | `string` | <p>The unique id of the offending post</p> |
| data.offender_thread_id | `string` | <p>The unique id of the offending post's thread</p> |
| data.offender_title | `string` | <p>The title of the offending post</p> |
| data.offender_created_at | `timestamp` | <p>Timestamp of the offending post was created</p> |
| data.offender_author_created_at | `timestamp` | <p>Timestamp of the offending post's author created date</p> |
| data.offender_author_username | `string` | <p>The username of the offending post's author</p> |
| data.offender_author_email | `string` | <p>The email of the user who created the offending post</p> |
| data.offender_author_id | `string` | <p>The unique id of the offending post's author</p> |
| data.reporter_reason | `string` | <p>The reason for the report</p> |
| data.reporter_user_id | `string` | <p>The unique id of the reporting user</p> |
| data.reporter_username | `string` | <p>The username of the reporting user</p> |
| data.created_at | `timestamp` | <p>Timestamp of when the post report was created</p> |
| data.updated_at | `timestamp` | <p>Timestamp of when the post report was last updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error retrieving the post reports</p> |

## <a name='(Admin)-Page-Post-Report-Notes'></a> (Admin) Page Post Report Notes
[Back to top](#top)

<p>Used to page through post moderation report notes.</p>

```
GET /reports/postnotes/:postReportId
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| postReportId | `string` | <p>The unique id of the post report to retrieve notes for</p> |

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of post report notes to retrieve</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of post report notes to retrieve per page</p>_Default value: 10_<br> |
| desc | `boolean` | **optional** <p>Boolean indicating whether or not to sort the results in descending order</p>_Default value: true_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| count | `number` | <p>The total number of report notes</p> |
| limit | `number` | <p>The number of report notes to bring back per page</p> |
| page | `number` | <p>The current page of report notes brought back</p> |
| page_count | `number` | <p>The total number of pages</p> |
| desc | `boolean` | <p>Boolean indicating if the results are in descending order</p> |
| data | `object[]` | <p>An array of post report note objects</p> |
| data.id | `string` | <p>The unique id of the post report note</p> |
| data.report_id | `string` | <p>The unique id of the post report this note is for</p> |
| data.user_id | `string` | <p>The unique id of the user who left the note</p> |
| data.username | `string` | <p>The username of the user who left the note</p> |
| data.avatar | `string` | <p>The URL to the avatar of the user who left the note</p> |
| data.note | `string` | <p>The note message that was left on the report</p> |
| data.created_at | `timestamp` | <p>Timestamp of when the report note was created</p> |
| data.updated_at | `timestamp` | <p>Timestamp of when the report note was last updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error retrieving the post report notes</p> |

## <a name='(Admin)-Page-User-Report'></a> (Admin) Page User Report
[Back to top](#top)

<p>Used to page through user moderation reports.</p>

```
GET /reports/users
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of user reports to retrieve</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of user reports to retrieve per page</p>_Default value: 15_<br> |
| filter | `string` | **optional** <p>Used to filter reports by their status</p>_Allowed values: "Pending","Reviwed","Ignored","Bad Report"_ |
| field | `string` | **optional** <p>Indicates which column to sort by, used for table sorting</p>_Default value: created_at_<br>_Allowed values: "created_at","priority","reporter_username","offender_username","offender_email","offender_created_at"_ |
| desc | `boolean` | **optional** <p>Boolean indicating whether or not to sort the results in descending order</p>_Default value: false_<br> |
| search | `string` | **optional** <p>String used to search for a report by username</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| count | `number` | <p>The total number of reports</p> |
| limit | `number` | <p>The number of reports to bring back per page</p> |
| page | `number` | <p>The current page of reports brought back</p> |
| page_count | `number` | <p>The total number of pages</p> |
| filter | `string` | <p>Indicates the status type of the report being brought back</p> |
| field | `string` | <p>Indicates the field the reports are sorted by</p> |
| search | `string` | <p>Indicates the search string</p> |
| desc | `boolean` | <p>Boolean indicating if the results are in descending order</p> |
| data | `object[]` | <p>An array of user reports. Sort order varies depending on the query parameters passed in.</p> |
| data.id | `string` | <p>The unique id of the user report</p> |
| data.status | `string` | <p>The status of the user report</p> |
| data.reviewer_user_id | `string` | <p>The unique id of the user who reviewed the user report</p> |
| data.offender_ban_expiration | `timestamp` | <p>If the user is banned, the expiration of their ban</p> |
| data.offender_board_banned | `boolean` | <p>Boolean indicating if user is board banned</p> |
| data.offender_created_at | `timestamp` | <p>When the offending user created their account</p> |
| data.offender_email | `string` | <p>The email of the offending user</p> |
| data.offender_user_id | `string` | <p>The unique id of the offending user</p> |
| data.offender_username | `string` | <p>The username of the offending user</p> |
| data.reporter_reason | `string` | <p>The reason for the report</p> |
| data.reporter_user_id | `string` | <p>The unique id of the reporting user</p> |
| data.reporter_username | `string` | <p>The username of the reporting user</p> |
| data.created_at | `timestamp` | <p>Timestamp of when the user report was created</p> |
| data.updated_at | `timestamp` | <p>Timestamp of when the user report was last updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error retrieving the user reports</p> |

## <a name='(Admin)-Page-User-Report-Notes'></a> (Admin) Page User Report Notes
[Back to top](#top)

<p>Used to page through user moderation report notes.</p>

```
GET /reports/usernotes/:userReportId
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| userReportId | `string` | <p>The unique id of the user report to retrieve notes for</p> |

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of user report notes to retrieve</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of user report notes to retrieve per page</p>_Default value: 10_<br> |
| desc | `boolean` | **optional** <p>Boolean indicating whether or not to sort the results in descending order</p>_Default value: true_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| count | `number` | <p>The total number of report notes</p> |
| limit | `number` | <p>The number of report notes to bring back per page</p> |
| page | `number` | <p>The current page of report notes brought back</p> |
| page_count | `number` | <p>The total number of pages</p> |
| desc | `boolean` | <p>Boolean indicating if the results are in descending order</p> |
| data | `object[]` | <p>An array of user report note objects.</p> |
| data.id | `string` | <p>The unique id of the user report note</p> |
| data.report_id | `string` | <p>The unique id of the user report this note is for</p> |
| data.user_id | `string` | <p>The unique id of the user who left the note</p> |
| data.username | `string` | <p>The username of the user who left the note</p> |
| data.avatar | `string` | <p>The URL to the avatar of the user who left the note</p> |
| data.note | `string` | <p>The note message that was left on the report</p> |
| data.created_at | `timestamp` | <p>Timestamp of when the report note was created</p> |
| data.updated_at | `timestamp` | <p>Timestamp of when the report note was last updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error retrieving the user report notes</p> |

## <a name='(Admin)-Update-Message-Report'></a> (Admin) Update Message Report
[Back to top](#top)

<p>Used to update the status of a message moderation report.</p>

```
PUT /reports/messages
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the message report</p> |
| status | `string` | <p>The updated note status</p>_Allowed values: "Pending","Reviewed","Ignored","Bad Report"_ |
| reviewer_user_id | `string` | <p>The id of the user updating the message report</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the message report which was created</p> |
| status | `string` | <p>The status of the report</p> |
| reporter_user_id | `string` | <p>The unique id of the user initiating the report</p> |
| reporter_reason | `string` | <p>The reporter's reason for reporting the offending message</p> |
| reviewer_user_id | `string` | <p>The unique id of the user reviewing the report</p> |
| offender_message_id | `string` | <p>The unique id of the message being reported</p> |
| created_at | `timestamp` | <p>Timestamp of when the message report was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the message report was updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error updating the message report</p> |

## <a name='(Admin)-Update-Message-Report-Note'></a> (Admin) Update Message Report Note
[Back to top](#top)

<p>Used to update an existing note on message moderation reports.</p>

```
PUT /reports/messagenotes
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the message report note</p> |
| note | `string` | <p>The updated note</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id for the message report note</p> |
| report_id | `string` | <p>The id of the message report to leave the note on</p> |
| user_id | `string` | <p>The id of the user leaving the message report note</p> |
| username | `string` | <p>The username of the user who left the message report note</p> |
| avatar | `string` | <p>The url to the avatar of the user who left the message report note</p> |
| note | `string` | <p>The note being left on the message report</p> |
| created_at | `timestamp` | <p>Timestamp of when the message report note was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the message report note was last updated</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>Note must not be empty</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error updating the message report note</p> |

## <a name='(Admin)-Update-Post-Report'></a> (Admin) Update Post Report
[Back to top](#top)

<p>Used to update the status of a post moderation report.</p>

```
PUT /reports/posts
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the post report note</p> |
| status | `string` | <p>The updated note status</p>_Allowed values: "Pending","Reviewed","Ignored","Bad Report"_ |
| reviewer_user_id | `string` | <p>The id of the user updating the post report</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the post report which was updated</p> |
| status | `string` | <p>The status of the report</p> |
| reporter_user_id | `string` | <p>The unique id of the user initiating the report</p> |
| reporter_reason | `string` | <p>The reporter's reason for reporting the offending post</p> |
| reviewer_user_id | `string` | <p>The unique id of the user reviewing the report</p> |
| offender_post_id | `string` | <p>The unique id of the post being reported</p> |
| created_at | `timestamp` | <p>Timestamp of when the post report was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the post report was updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error updating the post report</p> |

## <a name='(Admin)-Update-Post-Report-Note'></a> (Admin) Update Post Report Note
[Back to top](#top)

<p>Used to update an existing note on post moderation reports.</p>

```
PUT /reports/usernotes
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the post report note</p> |
| note | `string` | <p>The updated note</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id for the post report note</p> |
| report_id | `string` | <p>The id of the post report to leave the note on</p> |
| user_id | `string` | <p>The id of the user leaving the post report note</p> |
| username | `string` | <p>The username of the user who left the post report note</p> |
| avatar | `string` | <p>The url to the avatar of the user who left the post report note</p> |
| note | `string` | <p>The note being left on the post report</p> |
| created_at | `timestamp` | <p>Timestamp of when the post report note was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the post report note was last updated</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>Note must not be empty</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error updating the post report note</p> |

## <a name='(Admin)-Update-User-Report'></a> (Admin) Update User Report
[Back to top](#top)

<p>Used to update the status of a user moderation report.</p>

```
PUT /reports/users
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the user report</p> |
| status | `string` | <p>The updated note status</p>_Allowed values: "Pending","Reviewed","Ignored","Bad Report"_ |
| reviewer_user_id | `string` | <p>The id of the user updating the user report</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the user report which was created</p> |
| status | `string` | <p>The status of the report</p> |
| reporter_user_id | `string` | <p>The unique id of the user initiating the report</p> |
| reporter_reason | `string` | <p>The reporter's reason for reporting the offending user</p> |
| reviewer_user_id | `string` | <p>The unique id of the user reviewing the report</p> |
| offender_user_id | `string` | <p>The unique id of the user being reported</p> |
| created_at | `timestamp` | <p>Timestamp of when the user report was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the user report was updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error updating the user report</p> |

## <a name='(Admin)-Update-User-Report-Note'></a> (Admin) Update User Report Note
[Back to top](#top)

<p>Used to update an existing note on user moderation reports.</p>

```
PUT /reports/usernotes
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the user report note</p> |
| note | `string` | <p>The updated note</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id for the user report note</p> |
| report_id | `string` | <p>The id of the user report to leave the note on</p> |
| user_id | `string` | <p>The id of the user leaving the user report note</p> |
| username | `string` | <p>The username of the user who left the user report note</p> |
| avatar | `string` | <p>The url to the avatar of the user who left the user report note</p> |
| note | `string` | <p>The note being left on the user report</p> |
| created_at | `timestamp` | <p>Timestamp of when the user report note was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the user report note was last updated</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>Note must not be empty</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error updating the user report note</p> |

## <a name='Create-Message-Report'></a> Create Message Report
[Back to top](#top)

<p>Used to report a private message for moderators/administrators to review.</p>

```
POST /reports/messages
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| reporter_user_id | `string` | <p>The unique id of the user initiating the report</p> |
| reporter_reason | `string` | <p>The reporter's reason for reporting the offending private message</p> |
| offender_message_id | `string` | <p>The unique id of the private message being reported</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the private message report which was created</p> |
| status | `string` | <p>The status of the report</p> |
| reporter_user_id | `string` | <p>The unique id of the user initiating the report</p> |
| reporter_reason | `string` | <p>The reporter's reason for reporting the offending message</p> |
| reviewer_user_id | `string` | <p>The unique id of the user reviewing the report</p> |
| offender_message_id | `string` | <p>The unique id of the private message being reported</p> |
| created_at | `timestamp` | <p>Timestamp of when the private message report was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the private message report was updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue reporting the message report</p> |

## <a name='Create-Post-Report'></a> Create Post Report
[Back to top](#top)

<p>Used to report a post for moderators/administrators to review.</p>

```
POST /reports/users
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| reporter_user_id | `string` | <p>The unique id of the user initiating the report</p> |
| reporter_reason | `string` | <p>The reporter's reason for reporting the offending post</p> |
| offender_post_id | `string` | <p>The unique id of the post being reported</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the post report which was created</p> |
| status | `string` | <p>The status of the report</p> |
| reporter_user_id | `string` | <p>The unique id of the user initiating the report</p> |
| reporter_reason | `string` | <p>The reporter's reason for reporting the offending post</p> |
| reviewer_user_id | `string` | <p>The unique id of the user reviewing the report</p> |
| offender_post_id | `string` | <p>The unique id of the post being reported</p> |
| created_at | `timestamp` | <p>Timestamp of when the post report was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the post report was updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue reporting the post</p> |

## <a name='Create-User-Report'></a> Create User Report
[Back to top](#top)

<p>Used to report a user for moderators/administrators to review.</p>

```
POST /reports/users
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| reporter_user_id | `string` | <p>The unique id of the user initiating the report</p> |
| reporter_reason | `string` | <p>The reporter's reason for reporting the offending user</p> |
| offender_user_id | `string` | <p>The unique id of the user being reported</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the user report which was created</p> |
| status | `string` | <p>The status of the report</p> |
| reporter_user_id | `string` | <p>The unique id of the user initiating the report</p> |
| reporter_reason | `string` | <p>The reporter's reason for reporting the offending user</p> |
| reviewer_user_id | `string` | <p>The unique id of the user reviewing the report</p> |
| offender_user_id | `string` | <p>The unique id of the user being reported</p> |
| created_at | `timestamp` | <p>Timestamp of when the user report was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the user report was updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue reporting the user</p> |

# <a name='Roles'></a> Roles

## <a name='Add-Roles'></a> Add Roles
[Back to top](#top)

<p>Add a new role.</p>

```
POST /admin/roles/add
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | **optional** <p>The id of the role to add, for hardcoded ids.</p> |
| name | `string` | <p>The name of the role to add.</p> |
| description | `string` | <p>The description of the role to add.</p> |
| priority | `string` | <p>The priorty of the role to add.</p> |
| highlight_color | `string` | **optional** <p>The highlight color of the role to add.</p> |
| permissions | `Object` | <p>The permission set for this role.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the added role.</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>There name of the role must be unique.</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue adding the role.</p> |

## <a name='All-Roles'></a> All Roles
[Back to top](#top)

<p>Retrieve all role.</p>

```
GET /admin/roles/all
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| roles | `object[]` | <p>An array of all the roles.</p> |
| roles.id | `string` | <p>The unique id of the role</p> |
| roles.name | `string` | <p>The name of the role</p> |
| roles.description | `string` | <p>The description of the role</p> |
| roles.lookup | `string` | <p>A unique identifier for the role</p> |
| roles.priority | `number` | <p>The priority of the role, with 0 being the highest priority</p>_Size range: 0..n_<br> |
| roles.highlight_color | `string` | <p>An html hex value color used to highlight users based on their role</p> |
| permissions | `object` | <p>An object containing all this roles permissions</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the roles.</p> |

## <a name='Page-Users-with-Role'></a> Page Users with Role
[Back to top](#top)

<p>Page all users with a particular role.</p>

```
GET /admin/roles/:id/users
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the role to find users for</p> |

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of users to retrieve</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of users to retrieve per page</p>_Default value: 15_<br> |
| search | `string` | **optional** <p>Allows user to filter the search results</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| users | `object[]` | <p>An array holding users with this role</p> |
| users.id | `string` | <p>The id of the user</p> |
| users.username | `string` | <p>The The username of the user</p> |
| users.email | `string` | <p>The email of the user</p> |
| users.roles | `string[]` | <p>An array containing the lookups values of all the roles this user has</p> |
| users.priority | `number` | <p>The user's highest role priority</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the user data.</p> |

## <a name='Remove-Roles'></a> Remove Roles
[Back to top](#top)

<p>Remove a role.</p>

```
DELETE /admin/roles/remove/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the role to remove.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the removed role.</p> |
| name | `string` | <p>The name of the removed role.</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue removing the role.</p> |

## <a name='Reprioritize-Roles'></a> Reprioritize Roles
[Back to top](#top)

<p>Reprioritizes all roles.</p>

```
UPDATE /admin/roles/reprioritize
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| roles | `object[]` | <p>Array containing role objects</p> |
| roles.id | `string` | <p>The id of the role</p> |
| roles.priority | `string` | <p>The updated priorty of the role</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| STATUS | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue reprioritizing the roles.</p> |

## <a name='Update-Roles'></a> Update Roles
[Back to top](#top)

<p>Add a new role.</p>

```
PUT /admin/roles/update
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the role to update.</p> |
| name | `string` | <p>The updated name of the role.</p> |
| description | `string` | <p>The updated description of the role.</p> |
| priority | `string` | <p>The updated priorty of the role.</p> |
| highlight_color | `string` | **optional** <p>The updated highlight color.</p> |
| lookup | `string` | <p>The lookup string of the role.</p> |
| permissions | `Object` | <p>The updated permission set.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the updated role.</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>There name of the role must be unique.</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue adding the role.</p> |

# <a name='Settings'></a> Settings

## <a name='(Admin)-Add-IP-Rule-to-Blacklist'></a> (Admin) Add IP Rule to Blacklist
[Back to top](#top)

<p>Used to add an IP Rule to the blacklist</p>

```
POST /admin/settings/blacklist
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| blacklist | `object[]` | <p>Array containing blacklisted IPs and info</p> |
| blacklist.id | `string` | <p>Unique id for the Blacklisted IP rule.</p> |
| blacklist.ip_data | `string` | <p>A single ip, ip range or wildcard ip.</p> |
| blacklist.note | `string` | <p>A note/name for the Blacklisted IP rule.</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue adding to the blacklist.</p> |

## <a name='(Admin)-Delete-existing-IP-Rule-from-Blacklist'></a> (Admin) Delete existing IP Rule from Blacklist
[Back to top](#top)

<p>Used to update an existing IP Rule in the blacklist</p>

```
DELETE /admin/settings/blacklist/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the blacklist rule to delete</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| blacklist | `object[]` | <p>Array containing blacklisted IPs and info</p> |
| blacklist.id | `string` | <p>Unique id for the Blacklisted IP rule.</p> |
| blacklist.ip_data | `string` | <p>A single ip, ip range or wildcard ip.</p> |
| blacklist.note | `string` | <p>A note/name for the Blacklisted IP rule.</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue deleting from the blacklist.</p> |

## <a name='(Admin)-Find'></a> (Admin) Find
[Back to top](#top)

<p>Used to fetch all web app settings. Allows admins to grab settings defined in config.js</p>

```
GET /api/configurations
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| verify_registration | `boolean` | <p>Boolean indicating if users need verify their accounts via email</p> |
| login_required | `boolean` | <p>Boolean indicating if users need to login to view posts</p> |
| invite_only | `boolean` | <p>Boolean indicating if forum is invite only</p> |
| saas_mode | `boolean` | <p>Boolean indicating if forum is in saas mode</p> |
| revision | `boolean` | <p>The current git revision of the running instance of Epochtalk</p> |
| ga_key | `string` | <p>Google analytics key for reCaptcha</p> |
| website | `object` | <p>Object containing website configs</p> |
| website.title | `string` | <p>The title of the website</p> |
| website.description | `string` | <p>Website description text</p> |
| website.keywords | `string` | <p>Website keywords</p> |
| website.logo | `string` | <p>The logo for the website</p> |
| website.favicon | `string` | <p>The favicon for the website</p> |
| emailer | `object` | <p>Object containing configurations for the email server</p> |
| emailer.sender | `string` | <p>Email address that emails will be sent from</p> |
| emailer.options.host | `string` | <p>The SMTP host</p> |
| emailer.options.port | `number` | <p>The SMTP port</p> |
| emailer.options.auth.user | `string` | <p>The SMTP username</p> |
| emailer.options.auth.pass | `string` | <p>The SMTP password</p> |
| emailer.options.secure | `boolean` | <p>Boolean indicating whether or not to use SSL</p> |
| images | `object` | <p>Object containing image server configurations</p> |
| images.storage | `string` | <p>Where to store images</p>_Allowed values: "local","s3"_ |
| images.max_size | `number` | <p>Max image file size</p> |
| images.expiration | `number` | <p>Expiration time for unused images</p> |
| images.interval | `number` | <p>Interval for checking for unused images</p> |
| images.local | `object` | <p>Object containing local image server configurations</p> |
| images.local.dir | `string` | <p>Path to directory to store uploaded images</p> |
| images.local.path | `string` | <p>Path to relative to host of where to serve images</p> |
| images.s3 | `object` | <p>Object containing s3 image server configurations</p> |
| images.s3.root | `string` | <p>The s3 root url</p> |
| images.s3.dir | `string` | <p>The s3 directory</p> |
| images.s3.bucket | `string` | <p>The s3 bucket</p> |
| images.s3.region | `string` | <p>The s3 region</p> |
| images.s3.access_key | `string` | <p>The s3 access key</p> |
| images.s3.secret_key | `string` | <p>The s3 secret key</p> |
| rate_limiting | `object` | <p>Object containing rate limit configurations</p> |
| rate_limiting.namespace | `string` | <p>Redis namespace prefix for rate limit configurations</p> |
| rate_limiting.get | `object` | <p>Object containing GET rate limit configurations</p> |
| rate_limiting.get.interval | `number` | <p>The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: -1...n_<br> |
| rate_limiting.get.max_in_interval | `number` | <p>How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: 1...n_<br> |
| rate_limiting.get.min_difference | `number` | <p>How long between each request (e.g. how much time between each MAX_IN_INTERVAL)</p> |
| rate_limiting.post.interval | `number` | <p>The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: -1...n_<br> |
| rate_limiting.post.max_in_interval | `number` | <p>How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: 1...n_<br> |
| rate_limiting.post.min_difference | `number` | <p>How long between each request (e.g. how much time between each MAX_IN_INTERVAL)</p> |
| rate_limiting.put.interval | `number` | <p>The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: -1...n_<br> |
| rate_limiting.put.max_in_interval | `number` | <p>How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: 1...n_<br> |
| rate_limiting.put.min_difference | `number` | <p>How long between each request (e.g. how much time between each MAX_IN_INTERVAL)</p> |
| rate_limiting.delete.interval | `number` | <p>The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: -1...n_<br> |
| rate_limiting.delete.max_in_interval | `number` | <p>How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: 1...n_<br> |
| rate_limiting.delete.min_difference | `number` | <p>How long between each request (e.g. how much time between each MAX_IN_INTERVAL)</p> |

## <a name='(Admin)-Get-Blacklist'></a> (Admin) Get Blacklist
[Back to top](#top)

<p>Used to fetch the IP blacklist</p>

```
GET /admin/settings/blacklist
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| blacklist | `object[]` | <p>Array containing blacklisted IPs and info</p> |
| blacklist.id | `string` | <p>Unique id for the Blacklisted IP rule.</p> |
| blacklist.ip_data | `string` | <p>A single ip, ip range or wildcard ip.</p> |
| blacklist.note | `string` | <p>A note/name for the Blacklisted IP rule.</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the blacklist.</p> |

## <a name='(Admin)-Get-Theme'></a> (Admin) Get Theme
[Back to top](#top)

<p>Used to fetch theme vars in _custom-variables.scss</p>

```
GET /theme
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| base-line-height | `string` | <p>Base line height for entire forum</p> |
| base-background-color | `string` | <p>The background color for the entire forum</p> |
| color-primary | `string` | <p>The primary color for the forum, used for buttons, etc...</p> |
| base-font-sans | `string` | <p>Font family for the entire forum</p> |
| base-font-color | `string` | <p>Base font color for entire forum</p> |
| base-font-size | `string` | <p>Base font size for entire forum</p> |
| secondary-font-color | `string` | <p>Secondary font color, used for description text</p> |
| input-font-color | `string` | <p>Font color for input fields</p> |
| input-background-color | `string` | <p>Background color for all input fields</p> |
| border-color | `string` | <p>Color for all borders used in the forum</p> |
| header-bg-color | `string` | <p>Color for the forum header background</p> |
| header-font-color | `string` | <p>Font color for the forum header</p> |
| sub-header-color | `string` | <p>Color for sub headers and footers</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the theme.</p> |

## <a name='(Admin)-Preview-Theme'></a> (Admin) Preview Theme
[Back to top](#top)

<p>Used preview theme vars are compiled from _preview-variables.scss</p>

```
PUT /theme/preview
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| base-line-height | `string` | <p>Base line height for entire forum</p> |
| base-background-color | `string` | <p>The background color for the entire forum</p> |
| color-primary | `string` | <p>The primary color for the forum, used for buttons, etc...</p> |
| base-font-sans | `string` | <p>Font family for the entire forum</p> |
| base-font-color | `string` | <p>Base font color for entire forum</p> |
| base-font-size | `string` | <p>Base font size for entire forum</p> |
| secondary-font-color | `string` | <p>Secondary font color, used for description text</p> |
| input-font-color | `string` | <p>Font color for input fields</p> |
| input-background-color | `string` | <p>Background color for all input fields</p> |
| border-color | `string` | <p>Color for all borders used in the forum</p> |
| header-bg-color | `string` | <p>Color for the forum header background</p> |
| header-font-color | `string` | <p>Font color for the forum header</p> |
| sub-header-color | `string` | <p>Color for sub headers and footers</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| base-line-height | `string` | <p>Base line height for entire forum</p> |
| base-background-color | `string` | <p>The background color for the entire forum</p> |
| color-primary | `string` | <p>The primary color for the forum, used for buttons, etc...</p> |
| base-font-sans | `string` | <p>Font family for the entire forum</p> |
| base-font-color | `string` | <p>Base font color for entire forum</p> |
| base-font-size | `string` | <p>Base font size for entire forum</p> |
| secondary-font-color | `string` | <p>Secondary font color, used for description text</p> |
| input-font-color | `string` | <p>Font color for input fields</p> |
| input-background-color | `string` | <p>Background color for all input fields</p> |
| border-color | `string` | <p>Color for all borders used in the forum</p> |
| header-bg-color | `string` | <p>Color for the forum header background</p> |
| header-font-color | `string` | <p>Font color for the forum header</p> |
| sub-header-color | `string` | <p>Color for sub headers and footers</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue previewing the theme.</p> |

## <a name='(Admin)-Reset-Theme'></a> (Admin) Reset Theme
[Back to top](#top)

<p>Used reset custom variables to fall back to _default-variables.scss</p>

```
POST /theme
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| base-line-height | `string` | <p>Base line height for entire forum</p> |
| base-background-color | `string` | <p>The background color for the entire forum</p> |
| color-primary | `string` | <p>The primary color for the forum, used for buttons, etc...</p> |
| base-font-sans | `string` | <p>Font family for the entire forum</p> |
| base-font-color | `string` | <p>Base font color for entire forum</p> |
| base-font-size | `string` | <p>Base font size for entire forum</p> |
| secondary-font-color | `string` | <p>Secondary font color, used for description text</p> |
| input-font-color | `string` | <p>Font color for input fields</p> |
| input-background-color | `string` | <p>Background color for all input fields</p> |
| border-color | `string` | <p>Color for all borders used in the forum</p> |
| header-bg-color | `string` | <p>Color for the forum header background</p> |
| header-font-color | `string` | <p>Font color for the forum header</p> |
| sub-header-color | `string` | <p>Color for sub headers and footers</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue resetting the theme.</p> |

## <a name='(Admin)-Set-Theme'></a> (Admin) Set Theme
[Back to top](#top)

<p>Used to set theme vars in _custom-variables.scss</p>

```
PUT /theme
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| base-line-height | `string` | <p>Base line height for entire forum</p> |
| base-background-color | `string` | <p>The background color for the entire forum</p> |
| color-primary | `string` | <p>The primary color for the forum, used for buttons, etc...</p> |
| base-font-sans | `string` | <p>Font family for the entire forum</p> |
| base-font-color | `string` | <p>Base font color for entire forum</p> |
| base-font-size | `string` | <p>Base font size for entire forum</p> |
| secondary-font-color | `string` | <p>Secondary font color, used for description text</p> |
| input-font-color | `string` | <p>Font color for input fields</p> |
| input-background-color | `string` | <p>Background color for all input fields</p> |
| border-color | `string` | <p>Color for all borders used in the forum</p> |
| header-bg-color | `string` | <p>Color for the forum header background</p> |
| header-font-color | `string` | <p>Font color for the forum header</p> |
| sub-header-color | `string` | <p>Color for sub headers and footers</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| base-line-height | `string` | <p>Base line height for entire forum</p> |
| base-background-color | `string` | <p>The background color for the entire forum</p> |
| color-primary | `string` | <p>The primary color for the forum, used for buttons, etc...</p> |
| base-font-sans | `string` | <p>Font family for the entire forum</p> |
| base-font-color | `string` | <p>Base font color for entire forum</p> |
| base-font-size | `string` | <p>Base font size for entire forum</p> |
| secondary-font-color | `string` | <p>Secondary font color, used for description text</p> |
| input-font-color | `string` | <p>Font color for input fields</p> |
| input-background-color | `string` | <p>Background color for all input fields</p> |
| border-color | `string` | <p>Color for all borders used in the forum</p> |
| header-bg-color | `string` | <p>Color for the forum header background</p> |
| header-font-color | `string` | <p>Font color for the forum header</p> |
| sub-header-color | `string` | <p>Color for sub headers and footers</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue setting the theme.</p> |

## <a name='(Admin)-Update-existing-IP-Rule-in-Blacklist'></a> (Admin) Update existing IP Rule in Blacklist
[Back to top](#top)

<p>Used to update an existing IP Rule in the blacklist</p>

```
PUT /admin/settings/blacklist
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| blacklist | `object[]` | <p>Array containing blacklisted IPs and info</p> |
| blacklist.id | `string` | <p>Unique id for the Blacklisted IP rule.</p> |
| blacklist.ip_data | `string` | <p>A single ip, ip range or wildcard ip.</p> |
| blacklist.note | `string` | <p>A note/name for the Blacklisted IP rule.</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue updating the blacklist.</p> |

## <a name='Update'></a> Update
[Back to top](#top)

<p>Used to update web app settings. Used in the admin panel.</p>

```
POST /api/configurations(Admin)
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| verify_registration | `boolean` | **optional** <p>Boolean indicating if users need verify their accounts via email</p> |
| login_required | `boolean` | **optional** <p>Boolean indicating if users need to login to view posts</p> |
| invite_only | `boolean` | **optional** <p>Boolean indicating if forum is invite only</p> |
| ga_key | `string` | **optional** <p>Google analytics key for reCaptcha</p> |
| website | `object` | **optional** <p>Object containing website configs</p> |
| website.title | `string` | **optional** <p>The title of the website</p> |
| website.description | `string` | **optional** <p>Website description text</p> |
| website.keywords | `string` | **optional** <p>Website keywords</p> |
| website.logo | `string` | **optional** <p>The logo for the website</p> |
| website.favicon | `string` | **optional** <p>The favicon for the website</p> |
| emailer | `object` | **optional** <p>Object containing configurations for the email server</p> |
| emailer.sender | `string` | **optional** <p>Email address that emails will be sent from</p> |
| emailer.options.host | `string` | **optional** <p>The SMTP host</p> |
| emailer.options.port | `number` | **optional** <p>The SMTP port</p> |
| emailer.options.auth.user | `string` | **optional** <p>The SMTP username</p> |
| emailer.options.auth.pass | `string` | **optional** <p>The SMTP password</p> |
| emailer.options.secure | `boolean` | **optional** <p>Boolean indicating whether or not to use SSL</p> |
| images | `object` | **optional** <p>Object containing image server configurations</p> |
| images.storage | `string` | **optional** <p>Where to store images</p>_Allowed values: "local","s3"_ |
| images.max_size | `number` | **optional** <p>Max image file size</p> |
| images.expiration | `number` | **optional** <p>Expiration time for unused images</p> |
| images.interval | `number` | **optional** <p>Interval for checking for unused images</p> |
| images.local | `object` | **optional** <p>Object containing local image server configurations</p> |
| images.local.dir | `string` | **optional** <p>Path to directory to store uploaded images</p> |
| images.local.path | `string` | **optional** <p>Path to relative to host of where to serve images</p> |
| images.s3 | `object` | **optional** <p>Object containing s3 image server configurations</p> |
| images.s3.root | `string` | **optional** <p>The s3 root url</p> |
| images.s3.dir | `string` | **optional** <p>The s3 directory</p> |
| images.s3.bucket | `string` | **optional** <p>The s3 bucket</p> |
| images.s3.region | `string` | **optional** <p>The s3 region</p> |
| images.s3.access_key | `string` | **optional** <p>The s3 access key</p> |
| images.s3.secret_key | `string` | **optional** <p>The s3 secret key</p> |
| rate_limiting | `object` | **optional** <p>Object containing rate limit configurations</p> |
| rate_limiting.get | `object` | **optional** <p>Object containing GET rate limit configurations</p> |
| rate_limiting.get.interval | `number` | **optional** <p>The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: -1...n_<br> |
| rate_limiting.get.max_in_interval | `number` | **optional** <p>How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: 1...n_<br> |
| rate_limiting.get.min_difference | `number` | **optional** <p>How long between each request (e.g. how much time between each MAX_IN_INTERVAL)</p> |
| rate_limiting.post.interval | `number` | **optional** <p>The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: -1...n_<br> |
| rate_limiting.post.max_in_interval | `number` | **optional** <p>How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: 1...n_<br> |
| rate_limiting.post.min_difference | `number` | **optional** <p>How long between each request (e.g. how much time between each MAX_IN_INTERVAL)</p> |
| rate_limiting.put.interval | `number` | **optional** <p>The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: -1...n_<br> |
| rate_limiting.put.max_in_interval | `number` | **optional** <p>How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: 1...n_<br> |
| rate_limiting.put.min_difference | `number` | **optional** <p>How long between each request (e.g. how much time between each MAX_IN_INTERVAL)</p> |
| rate_limiting.delete.interval | `number` | **optional** <p>The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: -1...n_<br> |
| rate_limiting.delete.max_in_interval | `number` | **optional** <p>How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)</p>_Size range: 1...n_<br> |
| rate_limiting.delete.min_difference | `number` | **optional** <p>How long between each request (e.g. how much time between each MAX_IN_INTERVAL)</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| config | `object` | <p>Same object that was passed in is returned upon success</p> |

# <a name='ThreadNotifications'></a> ThreadNotifications

## <a name='Get-Thread-Notification-Settings'></a> Get Thread Notification Settings
[Back to top](#top)

<p>Used to retreive the user's thread notification settings</p>

```
GET /threadnotifications
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| notify_replied_threads | `boolean` | <p>Boolean indicating if the user is receiving thread notifications</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an getting thread notification settings</p> |

## <a name='Toggle-Thread-Notifications'></a> Toggle Thread Notifications
[Back to top](#top)

<p>Used to toggle thread notifications</p>

```
PUT /threadnotifications
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| enabled | `boolean` | **optional** <p>Boolean indicating if thread notifications are enabled or not</p>_Default value: true_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| enabled | `boolean` | <p>Boolean indicating if the thread notifications were enabled or not</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an enabling thread notifications</p> |

# <a name='Threads'></a> Threads

## <a name='Create'></a> Create
[Back to top](#top)

<p>Used to create a new thread.</p>

```
POST /threads
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| title | `string` | <p>The title of the thread</p> |
| body | `string` | <p>The thread's body as it was entered in the editor by the user</p> |
| board_id | `string` | <p>The unique id of the board this thread is being created within</p> |
| locked | `boolean` | **optional** <p>Boolean indicating whether the thread is locked or unlocked</p>_Default value: false_<br> |
| sticky | `boolean` | **optional** <p>Boolean indicating whether the thread is stickied or not</p>_Default value: false_<br> |
| moderated | `boolean` | **optional** <p>Boolean indicating whether the thread is self-moderated or not</p>_Default value: false_<br> |
| poll | `object` | <p>Object containing poll data</p> |
| poll.max_answers | `number` | **optional** <p>The max answers allowed for poll</p>_Default value: 1_<br> |
| poll.expiration | `timestamp` | **optional** <p>Timestamp of when the poll expires</p> |
| poll.change_vote | `boolean` | **optional** <p>Boolean indicating if you can change your vote</p>_Default value: false_<br> |
| poll.display_mode | `string` | <p>Used for the UI display mode of the poll</p>_Allowed values: "always","voted","expired"_ |
| questions | `string[]` | <p>An array of poll questions</p> |
| answers | `string[]` | <p>An array of poll answers</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unqiue id of the post the thread is wrapping</p> |
| thread_id | `string` | <p>The unqiue id of the thread</p> |
| user_id | `string` | <p>The unique id of the user who created the thread</p> |
| title | `string` | <p>The title of the thread</p> |
| deleted | `boolean` | <p>Boolean indicating if the thread has been deleted</p> |
| locked | `boolean` | <p>Boolean indicating if the thread has been locked</p> |
| body_html | `string` | <p>The thread's body with any markup tags converted and parsed into html elements</p> |
| body | `string` | <p>The thread's body as it was entered in the editor by the user</p> |
| created_at | `timestamp` | <p>Timestamp of when the thread was created</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue creating the thread</p> |

## <a name='Create-Poll'></a> Create Poll
[Back to top](#top)

<p>Used to create a poll.</p>

```
POST /threads/:id/polls
```

### Parameters - `Param`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| thread_id | `string` | <p>The unique id of the thread the poll is in.</p> |
| question | `string` | <p>The question asked in the poll.</p> |
| answers | `string[]` | <p>The list of the answers to the question of this poll.</p> |

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| max_answers | `number` | **optional** <p>The max number of answers per vote.</p>_Default value: 1_<br> |
| expiration | `date` | **optional** <p>The expiration date of the poll.</p> |
| change_vote | `boolean` | **optional** <p>Boolean indicating whether users can change their vote.</p> |
| display_mode | `string` | <p>String indicating how the results are shown to users.</p>_Allowed values: "always","voted","expired"_ |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the poll</p> |
| question | `string` | <p>The question asked in the poll</p> |
| answers | `object[]` | <p>The list of the answers to the question of this poll</p> |
| answers.answer | `string` | <p>The answer to the question of this poll</p> |
| max_answers | `number` | <p>The max number of answer per vote</p> |
| change_vote | `boolean` | <p>Boolean indicating whether users can change their vote</p> |
| expiration | `date` | <p>The expiration date of the poll</p> |
| display_mode | `string` | <p>String indicating how the results are shown to users</p> |

### Error response

#### Error response - `Error 401`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Unauthorized |  | <p>User doesn't have permissions to create the poll</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue creating the thread</p> |

## <a name='Edit-Poll'></a> Edit Poll
[Back to top](#top)

<p>Used to edit a poll.</p>

```
PUT /threads/:thread_id/polls/:poll_id
```

### Parameters - `Param`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| thread_id | `string` | <p>The unique id of the thread the poll is in.</p> |
| poll_id | `string` | <p>The unique id of the poll to vote in.</p> |

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| max_answers | `number` | <p>The max number of answers per vote.</p> |
| expiration | `date` | <p>The expiration date of the poll.</p> |
| change_vote | `boolean` | <p>Boolean indicating whether users can change their vote.</p> |
| display_mode | `string` | <p>String indicating how the results are shown to users.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the poll</p> |
| max_answers | `number` | <p>The max number of answer per vote</p> |
| change_vote | `boolean` | <p>Boolean indicating whether users can change their vote</p> |
| expiration | `date` | <p>The expiration date of the poll</p> |
| display_mode | `string` | <p>String indicating how the results are shown to users</p> |

### Error response

#### Error response - `Error 401`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Unauthorized |  | <p>User doesn't have permissions to edit the poll</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue editing the thread</p> |

## <a name='Lock'></a> Lock
[Back to top](#top)

<p>Used to lock a thread and prevent any additional posts.</p>

```
POST /threads/:id/lock
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the thread to lock</p> |

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `boolean` | **optional** <p>Boolean indicating lock status, true if locked false if unlocked.</p>_Default value: true_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the poll</p> |
| locked | `boolean` | <p>Boolean indicating if the poll is locked</p> |

### Error response

#### Error response - `Error 401`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Unauthorized |  | <p>User doesn't have permissions to lock the thread</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue locking the thread</p> |

## <a name='Lock/Unlock-Poll'></a> Lock/Unlock Poll
[Back to top](#top)

<p>Used to lock or unlock a poll.</p>

```
POST /threads/:thread_id/polls/:poll_id/lock
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| thread_id | `string` | <p>The unique id of the thread the poll is in.</p> |
| poll_id | `string` | <p>The unique id of the poll to lock.</p> |

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| locked | `boolean` | <p>Boolean indicating to lock or unlock the poll</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the poll</p> |
| locked | `boolean` | <p>The value the poll's lock</p> |

### Error response

#### Error response - `Error 401`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Unauthorized |  | <p>User doesn't have permissions to lock the poll</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue locking/unlocking the poll</p> |

## <a name='Mark-Thread-Viewed'></a> Mark Thread Viewed
[Back to top](#top)

<p>Used to mark a thread as viewed</p>

```
POST /threads/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the thread to mark as viewed</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| success | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue marking the thread viewed</p> |

## <a name='Move'></a> Move
[Back to top](#top)

<p>Used to move a thread to a different board.</p>

```
POST /threads/:id/move
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the thread to move</p> |

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| new_board_id | `string` | <p>The unique id of the board to move this thread into.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the thread which was moved</p> |
| board_id | `string` | <p>The id of the board which the thread was moved to</p> |

### Error response

#### Error response - `Error 401`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Unauthorized |  | <p>User doesn't have permissions to move the thread</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue moving the thread</p> |

## <a name='Page-By-Board'></a> Page By Board
[Back to top](#top)

<p>Used to page through a board's threads.</p>

```
GET /threads
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| board_id | `string` | <p>The board whose threads to page through</p> |
| page | `number` | **optional** <p>The page of threads to bring back</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of threads to bring back per page</p>_Default value: 25_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The page of threads to bring back</p> |
| limit | `number` | <p>The number or threads per page to bring back</p> |
| banned_from_board | `boolean` | <p>Boolean indicating if the authed user has been banned from the current thread's board</p> |
| write_access | `boolean` | <p>Boolean indicating if the authed user has write access to this thread</p> |
| board | `object` | <p>Object containing information about the board the thread is in</p> |
| board.id | `string` | <p>The id of the board</p> |
| board.name | `string` | <p>The name of the board</p> |
| board.parent_id | `string` | <p>The id of the parent board if applicable</p> |
| board.watched | `boolean` | <p>Boolean indicating if the authed user is watching this board</p> |
| board.viewable_by | `number` | <p>The minimum priority to be able to view the board, null for no restriction</p> |
| board.postable_by | `number` | <p>The minimum priority to be able to post to the board, null for no restriction</p> |
| board.description | `string` | <p>The board description text</p> |
| board.thread_count | `number` | <p>The number of threads within the board</p> |
| board.post_count | `number` | <p>The number of posts within the board</p> |
| board.children | `object[]` | <p>An array containing child boards if applicable</p> |
| board.moderators | `object[]` | <p>Array containing data about the moderators of the board</p> |
| board.moderators.id | `string` | <p>The id of the moderator</p> |
| board.moderators.username | `string` | <p>The username of the moderator</p> |
| board.created_at | `timestamp` | <p>The created at timestamp of the board</p> |
| board.updated_at | `timestamp` | <p>The updated at timestamp of the board</p> |
| board.imported_at | `timestamp` | <p>The imported at timestamp of the board</p> |
| sticky | `object[]` | <p>An array of sticky threads within the board</p> |
| sticky.id | `string` | <p>The id of the stickied thread</p> |
| sticky.locked | `boolean` | <p>Boolean indicating if the thread is locked</p> |
| sticky.sticky | `boolean` | <p>Boolean indicating if the thread is stickied</p> |
| sticky.moderated | `boolean` | <p>Boolean indicating if the thread is self-moderated</p> |
| sticky.poll | `boolean` | <p>Boolean indicating if there is a poll in this thread</p> |
| sticky.created_at | `timestamp` | <p>Timestamp indicating when the thread was created</p> |
| sticky.updated_at | `timestamp` | <p>Timestamp indicating when the thread was last updated</p> |
| sticky.view_count | `number` | <p>The number of views this thread has received</p> |
| sticky.post_count | `number` | <p>The number of posts in this thread</p> |
| sticky.title | `string` | <p>The title of the thread</p> |
| sticky.last_post_id | `string` | <p>The id of the last post in the thread</p> |
| sticky.last_post_position | `number` | <p>The position of the last post in the thread</p> |
| sticky.last_post_created_at | `timestamp` | <p>Timestamp of when the last post was created</p> |
| sticky.last_post_username | `string` | <p>The username of the author of the last post</p> |
| sticky.last_post_avatar | `string` | <p>The avatar of the author of the last post</p> |
| sticky.user | `object` | <p>Object containg user data about the last post author</p> |
| sticky.user.id | `string` | <p>The id of the last post's author</p> |
| sticky.user.username | `string` | <p>The username of the last post's author</p> |
| sticky.user.deleted | `boolean` | <p>Boolean indicating if the last post's author has had their account deleted</p> |
| sticky.has_new_posts | `boolean` | <p>Boolean indicating if the thread has new posts since it was last viewed</p> |
| sticky.lastest_unread_position | `number` | <p>The position of the last unread post</p> |
| sticky.lastest_unread_post_id | `number` | <p>The id of the last unread post</p> |
| normal | `object[]` | <p>An array of threads within the board</p> |
| normal.id | `string` | <p>The id of the thread</p> |
| normal.locked | `boolean` | <p>Boolean indicating if the thread is locked</p> |
| normal.normal | `boolean` | <p>Boolean indicating if the thread is stickied</p> |
| normal.moderated | `boolean` | <p>Boolean indicating if the thread is self-moderated</p> |
| normal.poll | `boolean` | <p>Boolean indicating if there is a poll in this thread</p> |
| normal.created_at | `timestamp` | <p>Timestamp indicating when the thread was created</p> |
| normal.updated_at | `timestamp` | <p>Timestamp indicating when the thread was last updated</p> |
| normal.view_count | `number` | <p>The number of views this thread has received</p> |
| normal.post_count | `number` | <p>The number of posts in this thread</p> |
| normal.title | `string` | <p>The title of the thread</p> |
| normal.last_post_id | `string` | <p>The id of the last post in the thread</p> |
| normal.last_post_position | `number` | <p>The position of the last post in the thread</p> |
| normal.last_post_created_at | `timestamp` | <p>Timestamp of when the last post was created</p> |
| normal.last_post_username | `string` | <p>The username of the author of the last post</p> |
| normal.last_post_avatar | `string` | <p>The avatar of the author of the last post</p> |
| normal.user | `object` | <p>Object containg user data about the last post author</p> |
| normal.user.id | `string` | <p>The id of the thread's author</p> |
| normal.user.username | `string` | <p>The username of the thread's author</p> |
| normal.user.deleted | `boolean` | <p>Boolean indicating if the thread's author has had their account deleted</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the threads</p> |

## <a name='Page-Recently-Posted-In-Threads'></a> Page Recently Posted In Threads
[Back to top](#top)

<p>Used to page through recent threads posted in by the user.</p>

```
GET /threads/posted
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of threads to bring back</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of threads to bring back per page</p>_Default value: 25_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The current page of threads.</p> |
| limit | `number` | <p>The number of threads returned per page.</p> |
| count | `number` | <p>The total number of threads for this user.</p> |
| threads | `object[]` | <p>An array containing recently posted in threads.</p> |
| threads.id | `string` | <p>The id of the thread</p> |
| threads.board_id | `string` | <p>The id of the board the thread is in</p> |
| threads.board_name | `string` | <p>The name of the board the thread is in</p> |
| threads.locked | `boolean` | <p>Boolean indicating if the thread is locked</p> |
| threads.threads | `boolean` | <p>Boolean indicating if the thread is stickied</p> |
| threads.moderated | `boolean` | <p>Boolean indicating if the thread is self-moderated</p> |
| threads.poll | `boolean` | <p>Boolean indicating if there is a poll in this thread</p> |
| threads.created_at | `timestamp` | <p>Timestamp indicating when the thread was created</p> |
| threads.updated_at | `timestamp` | <p>Timestamp indicating when the thread was last updated</p> |
| threads.view_count | `number` | <p>The number of views this thread has received</p> |
| threads.post_count | `number` | <p>The number of posts in this thread</p> |
| threads.title | `string` | <p>The title of the thread</p> |
| threads.last_post_id | `string` | <p>The id of the last post in the thread</p> |
| threads.last_post_position | `number` | <p>The position of the last post in the thread</p> |
| threads.last_post_created_at | `timestamp` | <p>Timestamp of when the last post was created</p> |
| threads.last_post_username | `string` | <p>The username of the author of the last post</p> |
| threads.last_post_avatar | `string` | <p>The avatar of the author of the last post</p> |
| threads.user | `object` | <p>Object containg user data about the thread author</p> |
| threads.user.id | `string` | <p>The id of the thread's author</p> |
| threads.user.username | `string` | <p>The username of the thread's author</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the threads</p> |

## <a name='Purge'></a> Purge
[Back to top](#top)

<p>Used to purge a thread.</p>

```
DELETE /threads/:id/purge
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the thread to purge</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| success | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 401`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Unauthorized |  | <p>User doesn't have permissions to purge the thread</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue purging the thread</p> |

## <a name='Remove-Vote'></a> Remove Vote
[Back to top](#top)

<p>Used to remove a vote in a poll.</p>

```
DELETE /threads/:thread_id/polls/:poll_id/vote
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the thread the poll is in.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the poll</p> |
| question | `string` | <p>The question asked in the poll</p> |
| answers | `object[]` | <p>The list of the answers to the question of this poll</p> |
| answers.answer | `string` | <p>The answer to the question of this poll</p> |
| answers.id | `string` | <p>The id of the answer</p> |
| answers.votes | `number` | <p>The number of votes for this answer</p> |
| max_answers | `number` | <p>The max number of answer per vote</p> |
| has_voted | `boolean` | <p>Boolean indicating whether the user has voted</p> |
| change_vote | `boolean` | <p>Boolean indicating whether users can change their vote</p> |
| expiration | `date` | <p>The expiration date of the poll</p> |
| display_mode | `string` | <p>String indicating how the results are shown to users</p> |

### Error response

#### Error response - `Error 401`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Unauthorized |  | <p>User doesn't have permissions to vote in the poll</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue removing a vote in the poll</p> |

## <a name='Sticky'></a> Sticky
[Back to top](#top)

<p>Used to sticky a thread. This will cause the thread to show up at the top of the board it's posted within.</p>

```
POST /threads/:id/sticky
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the thread to sticky</p> |

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `boolean` | **optional** <p>Boolean indicating sticky status, true if stickied false if not.</p>_Default value: true_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the thread which was stickied</p> |
| sticky | `boolean` | <p>Boolean indicating if the thread is stickied</p> |

### Error response

#### Error response - `Error 401`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Unauthorized |  | <p>User doesn't have permissions to sticky the thread</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue stickying the thread</p> |

## <a name='Title'></a> Title
[Back to top](#top)

<p>Used to update the title of a thread.</p>

```
POST /threads/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the thread to update</p> |

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| title | `string` | <p>The new title for this thread.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the thread</p> |
| title | `string` | <p>The title of the thread</p> |
| body_html | `string` | <p>The thread's body with any markup tags converted and parsed into html elements</p> |
| body | `string` | <p>The thread's body as it was entered in the editor by the user</p> |
| thread_id | `string` | <p>The unqiue id of the thread</p> |
| updated_at | `timestamp` | <p>Timestamp of when the thread was updated</p> |

### Error response

#### Error response - `Error 401`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Unauthorized |  | <p>User doesn't have permissions to update the thread title.</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue updating the thread title.</p> |

## <a name='Vote'></a> Vote
[Back to top](#top)

<p>Used to vote in a poll.</p>

```
POST /threads/:thread_id/polls/:poll_id/vote
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| thread_id | `string` | <p>The unique id of the thread the poll is in.</p> |
| poll_id | `string` | <p>The unique id of the poll to vote in.</p> |

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| answer_ids | `string[]` | <p>The ids of the answers tied to the vote.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the poll</p> |
| question | `string` | <p>The question asked in the poll</p> |
| answers | `object[]` | <p>The list of the answers to the question of this poll</p> |
| answers.answer | `string` | <p>The answer to the question of this poll</p> |
| answers.id | `string` | <p>The id of the answer</p> |
| answers.votes | `number` | <p>The number of votes for this answer</p> |
| max_answers | `number` | <p>The max number of answer per vote</p> |
| has_voted | `boolean` | <p>Boolean indicating whether the user has voted</p> |
| locked | `boolean` | <p>Boolean indicating whether the poll is locked</p> |
| change_vote | `boolean` | <p>Boolean indicating whether users can change their vote</p> |
| expiration | `date` | <p>The expiration date of the poll</p> |
| display_mode | `string` | <p>String indicating how the results are shown to users</p> |

### Error response

#### Error response - `Error 401`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Unauthorized |  | <p>User doesn't have permissions to vote in the poll</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue voting in the poll</p> |

# <a name='Trust'></a> Trust

## <a name='Add-Trust-Board'></a> Add Trust Board
[Back to top](#top)

<p>Used to make trust scores visible on a specific board</p>

```
POST /admin/trustboards
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| board_id | `string` | <p>The unique id of the board to show trust scores on</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| board_id | `string` | <p>The unique id of the board trust scores were added to</p> |

### Error response

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User does not have permissions to add a trust board</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue adding board to trust boards</p> |

## <a name='Add-Trust-Feedback'></a> Add Trust Feedback
[Back to top](#top)

<p>Used to leave trust feedback on a user's account</p>

```
POST /trust
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The unique id of the user feedback is being left for</p> |
| risked_btc | `number` | **optional** <p>The amount of BTC that was risked in the transaction</p> |
| scammer | `boolean` | <p>Boolean indicating if user is a scammer, true for negative feedback, false for positive, and null for neutral</p> |
| reference | `string` | **optional** <p>A reference link for the feedback</p> |
| comments | `string` | **optional** <p>Feedback comments</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the added feedback.</p> |
| user_id | `string` | <p>The unique id of the user feedback was left on.</p> |
| reporter_id | `string` | <p>The unique id of the user leaving feedback.</p> |
| scammer | `boolean` | <p>Boolean indicating if user is a scammer, true for negative feedback, false for positive, and null for neutral.</p> |
| reference | `string` | <p>A reference link for the feedback.</p> |
| comments | `string` | <p>Feedback comments.</p> |
| created_at | `string` | <p>Timestamp of when feedback was created.</p> |

### Error response

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User does not have permissions to add trust feedback</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue adding feedback</p> |

## <a name='Delete-Trust-Board'></a> Delete Trust Board
[Back to top](#top)

<p>Used to remove trust score from a specific board</p>

```
DELETE /admin/trustboards/:board_id
```

### Parameters - `Params`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| board_id | `string` | <p>The unique id of the board to hide trust scores on</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| board_id | `string` | <p>The unique id of the board to hide trust scores on.</p> |

### Error response

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User does not have permissions to delete trust boards</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue deleting trust board</p> |

## <a name='Edit-Default-Trust-List'></a> Edit Default Trust List
[Back to top](#top)

<p>Used to edit the trust list of the default trust account</p>

```
POST /admin/trustlist
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| max_depth | `number` | <p>The max depth of the user's trust web</p> |
| list | `object[]` | <p>List containing trusted/untrusted users</p> |
| list.user_id_trusted | `string` | <p>The unique id of the user being trusted/untrusted</p> |
| list.username_trusted | `string` | <p>The username of the user being trusted/untrusted.</p> |
| list.type | `number` | <p>Trust type, 0 for trusted and 1 for untrusted</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| max_depth | `string` | <p>The max depth for this user's trust web</p> |
| trustList | `object[]` | <p>An array of trusted users.</p> |
| trustList.user_id_trusted | `string` | <p>The unique id of the user being trusted.</p> |
| trustList.username_trusted | `string` | <p>The username of the user being trusted.</p> |
| trustList.type | `number` | <p>Type 0 which represents trusted users.</p> |
| untrustList | `object[]` | <p>An array of untrusted users.</p> |
| untrustList.user_id_trusted | `string` | <p>The unique id of the user being untrusted.</p> |
| untrustList.username_trusted | `string` | <p>The username of the user being untrusted.</p> |
| untrustList.type | `number` | <p>Type 1 which represents untrusted users.</p> |

### Error response

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User doesn't have permissions to edit the default trust list.</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue editing the default trust list.</p> |

## <a name='Edit-Trust-List'></a> Edit Trust List
[Back to top](#top)

<p>Used to edit the authed user's trust list</p>

```
POST /trustlist
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| max_depth | `number` | <p>The max depth of the user's trust web</p> |
| list | `object[]` | <p>List containing trusted/untrusted users</p> |
| list.user_id_trusted | `string` | <p>The unique id of the user being trusted/untrusted</p> |
| list.username_trusted | `string` | <p>The username of the user being trusted/untrusted.</p> |
| list.type | `number` | <p>Trust type, 0 for trusted and 1 for untrusted</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| max_depth | `string` | <p>The max depth for this user's trust web</p> |
| trustList | `object[]` | <p>An array of trusted users.</p> |
| trustList.user_id_trusted | `string` | <p>The unique id of the user being trusted.</p> |
| trustList.username_trusted | `string` | <p>The username of the user being trusted.</p> |
| trustList.type | `number` | <p>Type 0 which represents trusted users.</p> |
| untrustList | `object[]` | <p>An array of untrusted users.</p> |
| untrustList.user_id_trusted | `string` | <p>The unique id of the user being untrusted.</p> |
| untrustList.username_trusted | `string` | <p>The username of the user being untrusted.</p> |
| untrustList.type | `number` | <p>Type 1 which represents untrusted users.</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue editing user's trust list.</p> |

## <a name='Get-Default-Trust-List'></a> Get Default Trust List
[Back to top](#top)

<p>Retrieve trust list for default trust account</p>

```
GET /admin/trustlist
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| max_depth | `string` | <p>The max depth for this user's trust web</p> |
| trustList | `object[]` | <p>An array of trusted users.</p> |
| trustList.user_id_trusted | `string` | <p>The unique id of the user being trusted.</p> |
| trustList.username_trusted | `string` | <p>The username of the user being trusted.</p> |
| trustList.type | `number` | <p>Type 0 which represents trusted users.</p> |
| untrustList | `object[]` | <p>An array of untrusted users.</p> |
| untrustList.user_id_trusted | `string` | <p>The unique id of the user being untrusted.</p> |
| untrustList.username_trusted | `string` | <p>The username of the user being untrusted.</p> |
| untrustList.type | `number` | <p>Type 1 which represents untrusted users.</p> |

### Error response

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User doesn't have permissions to get the default trust list.</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the default trust list.</p> |

## <a name='Get-Trust-Boards'></a> Get Trust Boards
[Back to top](#top)

<p>Retrieve array of board ids to show trust scores on</p>

```
GET /admin/trustboards
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| trusted_boards | `string[]` | <p>Array of trusted board ids</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving array of trusted boards.</p> |

## <a name='Get-Trust-Feedback'></a> Get Trust Feedback
[Back to top](#top)

<p>Retrieve trust feedback for a user</p>

```
GET /trustfeedback/:username
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The username to get trust feedback for</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| trusted | `object[]` | <p>An array of trusted feedback.</p> |
| trusted.comments | `string` | <p>Trust feedback comments.</p> |
| trusted.created_at | `timestamp` | <p>Timestamp of when feedback was left.</p> |
| trusted.id | `string` | <p>Unique id of the trust feedback.</p> |
| trusted.reference | `string` | <p>Refrence link for trust feedback.</p> |
| trusted.reporter | `object[]` | <p>User info for user who left trust feedback.</p> |
| trusted.reporter.id | `string` | <p>User id for user who left trust feedback.</p> |
| trusted.reporter.username | `string` | <p>Username for user who left trust feedback.</p> |
| trusted.reporter.stats | `object` | <p>User trust stats for user who left trust feedback.</p> |
| trusted.reporter.stats.neg | `number` | <p>Negative trust review count.</p> |
| trusted.reporter.stats.pos | `number` | <p>Positive trust review count.</p> |
| trusted.reporter.stats.score | `number` | <p>Calculated trust score.</p> |
| trusted.risked_btc | `number` | <p>Risked btc for feedback transaction.</p> |
| trusted.scammer | `boolean` | <p>Type of feedback positive, negative, neutral.</p> |
| untrusted | `object[]` | <p>An array of untrusted feedback.</p> |
| untrusted.comments | `string` | <p>Trust feedback comments.</p> |
| untrusted.created_at | `timestamp` | <p>Timestamp of when feedback was left.</p> |
| untrusted.id | `string` | <p>Unique id of the trust feedback.</p> |
| untrusted.reference | `string` | <p>Refrence link for trust feedback.</p> |
| untrusted.reporter | `object[]` | <p>User info for user who left trust feedback.</p> |
| untrusted.reporter.id | `string` | <p>User id for user who left trust feedback.</p> |
| untrusted.reporter.username | `string` | <p>Username for user who left trust feedback.</p> |
| untrusted.reporter.stats | `object` | <p>User trust stats for user who left trust feedback.</p> |
| untrusted.reporter.stats.neg | `number` | <p>Negative trust review count.</p> |
| untrusted.reporter.stats.pos | `number` | <p>Positive trust review count.</p> |
| untrusted.reporter.stats.score | `number` | <p>Calculated trust score.</p> |
| untrusted.risked_btc | `number` | <p>Risked btc for feedback transaction.</p> |
| untrusted.scammer | `boolean` | <p>Type of feedback positive, negative, neutral.</p> |
| sent | `object[]` | <p>An array of sent feedback.</p> |
| sent.comments | `string` | <p>Trust feedback comments.</p> |
| sent.created_at | `timestamp` | <p>Timestamp of when feedback was left.</p> |
| sent.id | `string` | <p>Unique id of the trust feedback.</p> |
| sent.reference | `string` | <p>Refrence link for trust feedback.</p> |
| sent.risked_btc | `number` | <p>Risked btc for feedback transaction.</p> |
| sent.scammer | `boolean` | <p>Type of feedback positive, negative, neutral.</p> |

### Error response

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User doesn't have permissions to get the default trust list.</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the default trust list.</p> |

## <a name='Get-Trust-List'></a> Get Trust List
[Back to top](#top)

<p>Retrieve trust list for authed user's account</p>

```
GET /trustlist
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| max_depth | `string` | <p>The max depth for this user's trust web</p> |
| trustList | `object[]` | <p>An array of trusted users.</p> |
| trustList.user_id_trusted | `string` | <p>The unique id of the user being trusted.</p> |
| trustList.username_trusted | `string` | <p>The username of the user being trusted.</p> |
| trustList.type | `number` | <p>Type 0 which represents trusted users.</p> |
| untrustList | `object[]` | <p>An array of untrusted users.</p> |
| untrustList.user_id_trusted | `string` | <p>The unique id of the user being untrusted.</p> |
| untrustList.username_trusted | `string` | <p>The username of the user being untrusted.</p> |
| untrustList.type | `number` | <p>Type 1 which represents untrusted users.</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the default trust list.</p> |

## <a name='Get-Trust-Score-Statistics'></a> Get Trust Score Statistics
[Back to top](#top)

<p>Used to retrieve trust score for a particular user.</p>

```
GET /trust/:username
```

### Parameters - `Params`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The username of the user to get trust stats for</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| neg | `number` | <p>Negative trust review count.</p> |
| pos | `number` | <p>Positive trust review count.</p> |
| score | `number` | <p>Calculated trust score.</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an retrieving trust score stats.</p> |

## <a name='Get-Trust-Tree'></a> Get Trust Tree
[Back to top](#top)

<p>Used to retrieve trust tree for the authed user.</p>

```
GET /trusttree
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| hierarchy | `boolean` | <p>Boolean indicating whether to grab the hierarchical trust view or the depth view</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| depthObj | `object[]` | <p>Object containing trusted users at this depth, only returned if hierarchy query parameter is false</p> |
| depthObj.depth | `string` | <p>The depth of the current depth object</p> |
| depthObj.users | `object[]` | <p>Object containing trusted users</p> |
| depthObj.users.id | `string` | <p>The id of the trusted/untrusted user</p> |
| depthObj.users.username | `string` | <p>The username of the trusted/untrusted user</p> |
| depthObj.users.level_trust | `number` | <p>The number of users at this level who trust this user</p> |
| trusted | `object[]` | <p>Object containing trusted users, only returned if hierarchy query parameter is true</p> |
| trusted.trusted | `object[]` | <p>Object containing the current trusted user's trusted users, this is a nested object of trusted users and contains the same information</p> |
| trusted.type | `number` | <p>0 for trusted 1 for untrusted</p> |
| trusted.user_id_trusted | `string` | <p>The id of the trusted/untrusted user</p> |
| trusted.username_trusted | `string` | <p>The username of the trusted/untrusted user</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an retrieving trust tree.</p> |

# <a name='Users'></a> Users

## <a name='(Admin)-Add-Roles'></a> (Admin) Add Roles
[Back to top](#top)

<p>Used to add a role or roles to a user. This allows Administrators to add new (Super) Administrators and (Global) Moderators.</p>

```
PUT /admin/users/roles/add
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| usernames | `string[]` | <p>A unique array of usernames to grant the role to</p> |
| role_id | `string` | <p>The unique id of the role to grant the user</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| users | `object[]` | <p>An array containing the users with added roles</p> |
| users.id | `string` | <p>The user's unique id</p> |
| users.username | `string` | <p>The user's username</p> |
| users.email | `string` | <p>The user's email address</p> |
| users.created_at | `timestamp` | <p>Timestamp of when the user's account was created</p> |
| users.updated_at | `timestamp` | <p>Timestamp of when the user's account was last updated</p> |
| users.roles | `object[]` | <p>An array containing the users role objects</p> |
| users.roles.id | `string` | <p>The unique id of the role</p> |
| users.roles.name | `string` | <p>The name of the role</p> |
| users.roles.description | `string` | <p>The description of the role</p> |
| users.roles.permissions | `object` | <p>The permissions that this role has</p> |
| users.roles.priority | `number` | <p>The priority of this role</p>_Size range: 1..n_<br> |
| users.roles.lookup | `string` | <p>The unique lookup string of this role</p> |
| users.roles.highlight_color | `string` | <p>The html highlight color for this role</p> |
| users.roles.created_at | `timestamp` | <p>Timestamp of when the role was created</p> |
| users.roles.updated_at | `timestamp` | <p>Timestamp of when the role was last updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error adding roles to the user</p> |

## <a name='(Admin)-Count-Users'></a> (Admin) Count Users
[Back to top](#top)

<p>This allows Administrators to get a count of how many users are registered. This is used in the admin panel for paginating through users.</p>

```
GET /admin/users/count
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| filter | `string` | **optional** <p>If banned is passed in, route will return count of banned users.</p>_Allowed values: "banned"_ |
| search | `string` | **optional** <p>Used to filter count by search string</p> |
| ip | `boolean` | **optional** <p>Boolean indicating that search string is an ip address</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| count | `number` | <p>The number of users registered given the passed in parameters</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error calculating the user count</p> |

## <a name='(Admin)-Create-User-Note'></a> (Admin) Create User Note
[Back to top](#top)

<p>This allows Administrators and Moderators to create user notes</p>

```
POST /user/notes
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The id of the user who the note is being left on</p> |
| author_id | `string` | <p>The id of the user leaving the note</p> |
| note | `string` | <p>The note being left on the user's account</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the user note</p> |
| user_id | `string` | <p>The id of the user who the note is being left on</p> |
| author_id | `string` | <p>The id of the user leaving the note</p> |
| note | `string` | <p>The note being left on the user's account</p> |
| created_at | `timestamp` | <p>The created at timestamp of the note</p> |
| updated_at | `timestamp` | <p>The updated at timestamp of the note</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error creating user note</p> |

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User doesn't have permission to create user note</p> |

## <a name='(Admin)-Delete-User-Note'></a> (Admin) Delete User Note
[Back to top](#top)

<p>This allows Administrators and Moderators to delete user notes</p>

```
DELETE /user/notes
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the note to delete</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the user note being deleted</p> |
| user_id | `string` | <p>The id of the user who the note is being left on</p> |
| author_id | `string` | <p>The id of the user leaving the note</p> |
| note | `string` | <p>The note being left on the user's account</p> |
| created_at | `timestamp` | <p>The created at timestamp of the note</p> |
| updated_at | `timestamp` | <p>The updated at timestamp of the note</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error deleting the user note</p> |

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User doesn't have permission to delete user note</p> |

## <a name='(Admin)-Page-User-Notes'></a> (Admin) Page User Notes
[Back to top](#top)

<p>This allows Administrators and Moderators to page through user notes</p>

```
GET /user/notes
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of results to return</p>_Default value: 1_<br>_Size range: 1..n_<br> |
| limit | `number` | **optional** <p>The number of results per page to return</p>_Default value: 25_<br>_Size range: 1..100_<br> |
| user_id | `string` | <p>The id of the user whose notes to page through</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The id of the user whose notes are being returned</p> |
| page | `number` | <p>The current page of results that is being returned</p> |
| limit | `number` | <p>The current number of results that is being returned per page</p> |
| next | `boolean` | <p>boolean indicating if there is a next page</p> |
| prev | `boolean` | <p>boolean indicating if there is a previous page</p> |
| data | `object[]` | <p>An array of user notes</p> |
| data.id | `string` | <p>The id of the user note</p> |
| data.author_id | `string` | <p>The id of the admin or mod who left the note</p> |
| data.author_name | `string` | <p>The username of the admin or mod who left the note</p> |
| data.author_avatar | `string` | <p>The avatar of the admin or mod who left the note</p> |
| data.author_highlight_color | `string` | <p>The highlight color of the admin or mod who left the note</p> |
| data.note | `string` | <p>The note left by the admin or mod</p> |
| data.created_at | `timestamp` | <p>The created at timestamp of the note</p> |
| data.updated_at | `timestamp` | <p>The updated at timestamp of the note</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error paging user notes</p> |

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User doesn't have permission to query user notes</p> |

## <a name='(Admin)-Page-Users'></a> (Admin) Page Users
[Back to top](#top)

<p>This allows Administrators to page through all registered users.</p>

```
GET /admin/users
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of registered users to retrieve</p>_Default value: 1_<br>_Size range: 1..n_<br> |
| limit | `number` | **optional** <p>The number of users to retrieve per page</p>_Default value: 25_<br>_Size range: 1..n_<br> |
| field | `string` | **optional** <p>The db field to sort the results by</p>_Default value: username_<br>_Allowed values: "username","email","updated_at","created_at","imported_at","ban_expiration"_ |
| desc | `boolean` | **optional** <p>Boolean indicating whether or not to sort the results in descending order</p>_Default value: false_<br> |
| filter | `string` | **optional** <p>If banned is passed in only banned users are returned</p>_Allowed values: "banned"_ |
| search | `string` | **optional** <p>Username to search for</p> |
| ip | `boolean` | **optional** <p>Boolean indicating that search string is an ip address</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| users | `object[]` | <p>An array of user objects</p> |
| users.id | `string` | <p>The unique id of the user</p> |
| users.username | `string` | <p>The username of the user</p> |
| users.email | `string` | <p>The email of the user</p> |
| users.deleted | `boolean` | <p>Boolean indicating if the user's account is deleted</p> |
| users.user_ips | `string[]` | <p>Array of user's known IP addresses</p> |
| users.last_active | `timestamp` | <p>Timestamp of when the user's account was last active</p> |
| users.ban_expiration | `timestamp` | <p>Timestamp of when the user's ban expires</p> |
| users.created_at | `timestamp` | <p>Timestamp of when the user was created</p> |
| users.updated_at | `timestamp` | <p>Timestamp of when the user was last updated</p> |
| users.imported_at | `timestamp` | <p>Timestamp of when the user was imported, null if not imported</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error retrieving the users</p> |

## <a name='(Admin)-Recover-Account'></a> (Admin) Recover Account
[Back to top](#top)

<p>Used by admins to recover a user's account. Sends an email to the account holder with a URL to visit to reset the account password.</p>

```
POST /user/recover/
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The id of the user's account to recover</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Sucess | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>The user was not found</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error recovering the user account</p> |

## <a name='(Admin)-Remove-Roles'></a> (Admin) Remove Roles
[Back to top](#top)

<p>Used to remove a role or roles from a user. This allows Administrators to remove roles from an account.</p>

```
PUT /admin/users/roles/remove
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The unique id of the user to remove the role from</p> |
| role_id | `string` | <p>The unique id of the role to remove from the user</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The user's unique id</p> |
| username | `string` | <p>The user's username</p> |
| email | `string` | <p>The user's email address</p> |
| created_at | `timestamp` | <p>Timestamp of when the user's account was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the user's account was last updated</p> |
| roles | `object[]` | <p>An array containing the users role objects</p> |
| roles.id | `string` | <p>The unique id of the role</p> |
| roles.name | `string` | <p>The name of the role</p> |
| roles.description | `string` | <p>The description of the role</p> |
| roles.permissions | `object` | <p>The permissions that this role has</p> |
| roles.priority | `number` | <p>The priority of this role</p>_Size range: 1..n_<br> |
| roles.lookup | `string` | <p>The unique lookup string of this role</p> |
| roles.highlight_color | `string` | <p>The html highlight color for this role</p> |
| roles.created_at | `timestamp` | <p>Timestamp of when the role was created</p> |
| roles.updated_at | `timestamp` | <p>Timestamp of when the role was last updated</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error removing roles from the user</p> |

## <a name='(Admin)-Search-Usernames'></a> (Admin) Search Usernames
[Back to top](#top)

<p>This allows Administrators to search usernames. This is used in the admin panel to autocomplete usernames when trying to quickly find a user.</p>

```
GET /admin/users/search
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>Username to search for, doesn't have to be a full username</p> |
| limit | `number` | **optional** <p>The number of usernames to return while searching</p>_Default value: 15_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| usernames | `string[]` | <p>An array containing usernames with accounts on the forum</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error searching for usernames</p> |

## <a name='(Admin)-Update-User-Note'></a> (Admin) Update User Note
[Back to top](#top)

<p>This allows Administrators and Moderators to update user notes</p>

```
PUT /user/notes
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the note to update</p> |
| note | `string` | <p>The updated note</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the user note</p> |
| user_id | `string` | <p>The id of the user who the note is being left on</p> |
| author_id | `string` | <p>The id of the user leaving the note</p> |
| note | `string` | <p>The note being left on the user's account</p> |
| created_at | `timestamp` | <p>The created at timestamp of the note</p> |
| updated_at | `timestamp` | <p>The updated at timestamp of the note</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error updating user note</p> |

#### Error response - `Error 403`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| Forbidden |  | <p>User doesn't have permission to update the user note</p> |

## <a name='Deactivate'></a> Deactivate
[Back to top](#top)

<p>Deactivate a user by userId</p>

```
POST /users/:userId/deactivate
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the user to deactivate</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error deactivating the user</p> |

## <a name='Delete'></a> Delete
[Back to top](#top)

<p>Delete a user by userId</p>

```
DELETE /users/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the user to delete</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The deleted user's username</p> |
| email | `string` | <p>The deleted user's email</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error deleteing the user</p> |

## <a name='Find'></a> Find
[Back to top](#top)

<p>Find a user by their username.</p>

```
GET /users/:username
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The username of the user to find</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The user's unique id</p> |
| username | `string` | <p>The user's username</p> |
| avatar | `string` | <p>URL to the user's avatar image</p> |
| ignored | `boolean` | <p>Boolean idicating if user is being ignored</p> |
| activity | `number` | <p>The user's activity number</p> |
| signature | `string` | <p>The user's signature with any markup tags converted and parsed into html elements</p> |
| raw_signature | `string` | <p>The user's signature as it was entered in the editor by the user</p> |
| priority | `number` | <p>The user's role priority</p> |
| post_count | `number` | <p>The number of posts made by this user</p> |
| collapsed_categories | `string[]` | <p>Array containing id of categories the user collapsed</p> |
| ignored_boards | `string[]` | <p>Array containing id of boards the user ignores</p> |
| posts_per_page | `number` | <p>Preference indicating the number of posts the user wants to view per page</p> |
| threads_per_page | `number` | <p>Preference indicating the number of threads the user wants to view per page</p> |
| name | `string` | <p>The user's actual name (e.g. John Doe)</p> |
| website | `string` | <p>URL to the user's website</p> |
| gender | `string` | <p>The user's gender</p> |
| dob | `timestamp` | <p>The user's date of birth</p> |
| location | `string` | <p>The user's location</p> |
| language | `string` | <p>The user's native language (e.g. English)</p> |
| created_at | `timestamp` | <p>Timestamp of when the user's account was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the user's account was last updated</p> |
| roles | `string[]` | <p>An array containing the users role lookups</p> |
| role_name | `string` | <p>The name of the user's primary role</p> |
| role_highlight_color | `string` | <p>The hex color to highlight the user's primary role</p> |

### Error response

#### Error response - `Error 404`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| NotFound |  | <p>The user was not found</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error looking up the user</p> |

## <a name='Ignore-User-Posts'></a> Ignore User Posts
[Back to top](#top)

<p>Used to ignore a particular user's posts</p>

```
POST /ignoreUsers/ignore/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the user whose posts to ignore</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The id of the user whose posts are ignored</p> |
| ignored | `boolean` | <p>Boolean indicating if the user's posts are being ignored</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error ignoring the user's posts</p> |

## <a name='Invitation-Exists'></a> Invitation Exists
[Back to top](#top)

<p>Used to check if an invitation has already been sent to an address.</p>

```
GET /invites/exists
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| email | `string` | <p>The email to check</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| found | `boolean` | <p>true if the email already has an invite.</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>There was an error checking if the invitation exists.</p> |

## <a name='Invitations'></a> Invitations
[Back to top](#top)

<p>Used to page through current invitations.</p>

```
GET /invites
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `string` | **optional** <p>The page of invitations to bring back.</p>_Default value: 1_<br> |
| limit | `string` | **optional** <p>The number of invitations to bring back.</p>_Default value: 25_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The page of invitations to return</p> |
| limit | `number` | <p>The number of invitations to return per page</p> |
| has_more | `boolean` | <p>Boolean indicating if there are more results on the next page</p> |
| invitations | `object[]` | <p>An array containing invitations.</p> |
| invitations.email | `string` | <p>The email of the user who was invited</p> |
| invitations.hash | `string` | <p>The user's invite has</p> |
| invitations.created_at | `timestamp` | <p>The invite created at timestamp</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>There was an error paging invitations.</p> |

## <a name='Invite'></a> Invite
[Back to top](#top)

<p>Used to invite a user to join via email.</p>

```
POST /invites
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| email | `string` | <p>User's email address.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| message | `string` | <p>Invitation sent success message</p> |
| confirm_token | `string` | <p>Invitation token</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>There was an error creating the invitation</p> |

## <a name='Page-Ignored-Users'></a> Page Ignored Users
[Back to top](#top)

<p>Used to page through ignored users</p>

```
GET /ignoreUsers/ignored
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of ignored users to return</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of ignored users to return per page</p>_Default value: 25_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The page of ignored users being returned</p> |
| limit | `number` | <p>The number of ignored users being returned per page</p> |
| prev | `boolean` | <p>Boolean indicating if there is a previous page</p> |
| next | `boolean` | <p>Boolean indicating if there is a next page</p> |
| data | `object[]` | <p>Array of ignored users</p> |
| data.id | `string` | <p>The id of the user being ignored</p> |
| data.ignored_since | `timestamp` | <p>Timestamp of when the user was ignored</p> |
| data.username | `string` | <p>The username of the user being ignored</p> |
| data.avatar | `string` | <p>The avatar of the user being ignored</p> |
| data.ignored | `boolean` | <p>Boolean indicating if the user is ignored</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error ignoring the user's posts</p> |

## <a name='Page-Users'></a> Page Users
[Back to top](#top)

<p>This allows users to page through all registered users.</p>

```
GET /search/users
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of registered users to retrieve</p>_Default value: 1_<br>_Size range: 1..n_<br> |
| limit | `number` | **optional** <p>The number of users to retrieve per page</p>_Default value: 25_<br>_Size range: 1..n_<br> |
| field | `string` | **optional** <p>The db field to sort the results by</p>_Default value: username_<br>_Allowed values: "username","role","created_at","post_count"_ |
| desc | `boolean` | **optional** <p>Boolean indicating whether or not to sort the results in descending order</p>_Default value: false_<br> |
| search | `string` | **optional** <p>Username to search for</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| field | `string` | <p>The field the results are sorted by</p> |
| desc | `boolean` | <p>The order the results are sorted in</p> |
| page | `number` | <p>The current page of the results</p> |
| page_count | `number` | <p>Total number of pages in results</p> |
| search | `string` | <p>The search term used in query</p> |
| limit | `number` | <p>The number of results returned per page</p> |
| count | `number` | <p>The total number of results</p> |
| users | `object[]` | <p>An array of user objects</p> |
| users.id | `string` | <p>The unique id of the user</p> |
| users.username | `string` | <p>The username of the user</p> |
| users.role | `string` | <p>The role of the user</p> |
| users.created_at | `timestamp` | <p>Timestamp of when the user was created</p> |
| users.post_count | `timestamp` | <p>The number of posts this user has made</p> |
| users.avatar | `timestamp` | <p>The user's avatar</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error retrieving the users</p> |

## <a name='Preferences'></a> Preferences
[Back to top](#top)

<p>Get a user's preferences.</p>

```
GET /users/preferences
```

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| posts_per_page | `number` | <p>The post limit for this user</p> |
| threads_per_page | `number` | <p>The thread limit for this user</p> |
| collapsed_categories | `string[]` | <p>The ids of the categories to collapse on boards view</p> |
| ignored_boards | `string[]` | <p>The ids of the boards the user ignores</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error getting the user's preferences</p> |

## <a name='Reactivate'></a> Reactivate
[Back to top](#top)

<p>Reactivate a user by userId</p>

```
POST /users/:id/reactivate
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the user to reactivate</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error reactivating the user</p> |

## <a name='Remove-Invite'></a> Remove Invite
[Back to top](#top)

<p>Used to remove an invite for a user via email.</p>

```
POST /invites/remove
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| email | `string` | <p>User's email address.</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| message | `string` | <p>Invitation removal success message</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error removing the invite</p> |

## <a name='Resend'></a> Resend
[Back to top](#top)

<p>Used to resend an invitation to a user</p>

```
POST /invites/resend
```

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| email | `string` | <p>User's email address</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| message | `string` | <p>Invitation sent success message</p> |
| confirm_token | `string` | <p>Invitation confirmation token</p> |

### Error response

#### Error response - `Error 4xx`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>There was an error resending the invitation</p> |

## <a name='Unignore-User-Posts'></a> Unignore User Posts
[Back to top](#top)

<p>Used to unignore a particular user's posts</p>

```
POST /ignoreUsers/unignore/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The id of the user whose posts to unignore</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| user_id | `string` | <p>The id of the user whose posts are unignore</p> |
| ignored | `boolean` | <p>Boolean indicating if the user's posts are being ignored</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error unignoring the user's posts</p> |

## <a name='Update'></a> Update
[Back to top](#top)

<p>Used to update user information such as profile fields, or passwords.</p>

```
PUT /users/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The user's unique id</p> |

### Parameters - `Payload`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | **optional** <p>The user's username</p> |
| email | `string` | **optional** <p>The user's email</p> |
| email_password | `string` | **optional** <p>The user's password used for updating email</p> |
| old_password | `string` | **optional** <p>The user's old password (used for changing password)</p> |
| password | `string` | **optional** <p>The user's new passowrd (used for changing password)</p> |
| confirmation | `string` | **optional** <p>The user's new password confirmation (used for changing password)</p> |
| name | `string` | **optional** <p>The user's name</p> |
| website | `string` | **optional** <p>URL to user's website</p> |
| btc_address | `string` | **optional** <p>User's bitcoin wallet address</p> |
| gender | `string` | **optional** <p>The user's gender</p> |
| dob | `date` | **optional** <p>Date version of the user's dob</p> |
| location | `string` | **optional** <p>The user's geographical location</p> |
| language | `string` | **optional** <p>The user's native language</p> |
| position | `string` | **optional** <p>The user's position title</p> |
| raw_signature | `string` | **optional** <p>The user's signature as it was entered in the editor by the user</p> |
| signature | `string` | **optional** <p>The user's signature with any markup tags converted and parsed into html elements</p> |
| avatar | `string` | **optional** <p>URL to the user's avatar</p> |
| timezone_offset | `string` | **optional** <p>Preference for UTC offset for date display</p> |
| patroller_view | `boolean` | **optional** <p>Preference to display patroller view</p> |
| posts_per_page | `numbers` | **optional** <p>Preference for how many post to view per page</p> |
| threads_per_page | `numbers` | **optional** <p>Preference for how many threads to view per page</p> |
| collapsed_categories | `string[]` | **optional** <p>Array of category id's which the user has collapsed</p> |
| ignored_boards | `string[]` | **optional** <p>Array of board id's which the user has ignored</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The user's unique id</p> |
| username | `string` | **optional**<p>The user's username</p> |
| email | `string` | **optional**<p>The user's email</p> |
| name | `string` | **optional**<p>The user's name</p> |
| website | `string` | **optional**<p>URL to user's website</p> |
| btc_address | `string` | **optional**<p>User's bitcoin wallet address</p> |
| gender | `string` | **optional**<p>The user's gender</p> |
| dob | `timestamp` | **optional**<p>Timestamp of the user's dob</p> |
| location | `string` | **optional**<p>The user's geographical location</p> |
| language | `string` | **optional**<p>The user's native language</p> |
| position | `string` | **optional**<p>The user's position title</p> |
| raw_signature | `string` | **optional**<p>The user's signature as it was entered in the editor by the user</p> |
| signature | `string` | **optional**<p>The user's signature with any markup tags converted and parsed into html elements</p> |
| avatar | `string` | **optional**<p>URL to the user's avatar</p> |
| collapsed_categories | `string[]` | <p>Array containing id of categories the user collapsed</p> |
| ignored_boards | `string[]` | <p>Array containing id of boards the user ignores</p> |
| timezone_offset | `string` | <p>Preference indicating UTC offset for date display</p> |
| posts_per_page | `number` | <p>Preference indicating the number of posts the user wants to view per page</p> |
| threads_per_page | `number` | <p>Preference indicating the number of threads the user wants to view per page</p> |

### Error response

#### Error response - `Error 400`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| BadRequest |  | <p>Occurs when resetting password and an invalid old password is provided</p> |

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an error updating the user</p> |

## <a name='User-Lookup'></a> User Lookup
[Back to top](#top)

<p>Query possible username matches and returns their ids for use in UI components</p>

```
GET /users/lookup/{username}
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| username | `string` | <p>The name of the user to send the message to</p> |
| self | `boolean` | <p>Include authed user in lookup</p> |
| restricted | `boolean` | <p>Hides some internal user accounts from the user lookup</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| users | `object[]` | <p>An array of possible username matches</p> |
| users.id | `string` | <p>The id of the user</p> |
| users.username | `string` | <p>The username of the user</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue looking up usernames</p> |

# <a name='Watchlist'></a> Watchlist

## <a name='Page-Watchlist-Boards'></a> Page Watchlist Boards
[Back to top](#top)

<p>Page though a user's watched boards</p>

```
GET /watchlist
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of watchlist to bring back</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of threads to bring back per page</p>_Default value: 25_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The page of results being returned</p> |
| limit | `number` | <p>The number of results per page</p> |
| has_more_boards | `boolean` | <p>Boolean indicating if there are more pages of boards</p> |
| boards | `object[]` | <p>An array containing watched board data</p> |
| boards.id | `string` | <p>The unique id of the watched board</p> |
| boards.name | `string` | <p>The name of the watched board</p> |
| boards.post_count | `number` | <p>The post count of the watched board</p> |
| boards.thread_count | `number` | <p>The thread count of the watched board</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the board watchlist threads.</p> |

## <a name='Page-Watchlist-Threads'></a> Page Watchlist Threads
[Back to top](#top)

<p>Page though a user's watched threads</p>

```
GET /watchlist
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of watchlist to bring back</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of threads to bring back per page</p>_Default value: 25_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The page of results being returned</p> |
| limit | `number` | <p>The number of results per page</p> |
| has_more_threads | `boolean` | <p>Boolean indicating if there are more pages of threads</p> |
| threads | `object[]` | <p>An array containing watched thread data</p> |
| threads.id | `string` | <p>The unique id of the watched thread</p> |
| threads.post_count | `number` | <p>The post count of the watched thread</p> |
| threads.view_count | `number` | <p>The view count of the watched thread</p> |
| threads.board_name | `string` | <p>The name of the board the thread is in</p> |
| threads.title | `string` | <p>The title of the thread being watched</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the watchlist threads.</p> |

## <a name='Page-Watchlist-Unread'></a> Page Watchlist Unread
[Back to top](#top)

<p>Used to page through a user's watchlist filtered by threads with unread posts.</p>

```
GET /watchlist
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | **optional** <p>The page of watchlist to bring back</p>_Default value: 1_<br> |
| limit | `number` | **optional** <p>The number of threads to bring back per page</p>_Default value: 25_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The page of results being returned</p> |
| limit | `number` | <p>The number of results per page</p> |
| has_more_threads | `boolean` | <p>Boolean indicating if there are more pages of threads</p> |
| threads | `object[]` | <p>An array containing watched thread data</p> |
| threads.id | `string` | <p>The unique id of the watched thread</p> |
| threads.locked | `boolean` | <p>Boolean indicating if the thread is locked</p> |
| threads.sticky | `boolean` | <p>Boolean indicating if the thread is stickied</p> |
| threads.has_new_post | `boolean` | <p>Boolean indicating if the thread has new posts</p> |
| created_at | `timestamp` | <p>Timestamp of when the thread was created</p> |
| updated_at | `timestamp` | <p>Timestamp of when the thread was last updated</p> |
| threads.view_count | `number` | <p>The view count of the watched thread</p> |
| threads.post_count | `number` | <p>The post count of the watched thread</p> |
| threads.title | `string` | <p>The title of the thread being watched</p> |
| threads.last_post_id | `string` | <p>The id of the last post in the thread</p> |
| threads.last_post_position | `number` | <p>The position of the last post in the thread</p> |
| threads.last_post_created_at | `timestamp` | <p>Timestamp of when the last post was created</p> |
| threads.last_post_username | `string` | <p>The username of the author of the last post</p> |
| threads.last_unread_position | `number` | <p>The position of the last unread post</p> |
| threads.last_unread_post_id | `string` | <p>The id of the last unread post</p> |
| threads.user | `object` | <p>Object containing data about the author of the thread</p> |
| threads.user.id | `string` | <p>The id of the author of the thread</p> |
| threads.user.username | `string` | <p>The username of the author of the thread</p> |
| threads.user.deleted | `boolean` | <p>Boolean indicating if the thread author has had their account deleted</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the watchlist threads.</p> |

## <a name='Unwatch-Board'></a> Unwatch Board
[Back to top](#top)

<p>Used to unmark a user as watching a board.</p>

```
DELETE /watchlist/boards/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the board being unwatched</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue unwatching the board</p> |

## <a name='Unwatch-Thread'></a> Unwatch Thread
[Back to top](#top)

<p>Used to unmark a user as watching a thread.</p>

```
DELETE /watchlist/threads/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the thread being unwatched</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue unwatching the thread</p> |

## <a name='View-Edit-Watchlist'></a> View Edit Watchlist
[Back to top](#top)

<p>Used to view boards and threads for editing a user's watchlist.</p>

```
GET /watchlist
```

### Parameters - `Query`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| limit | `number` | **optional** <p>The number of threads/boards to bring back per page</p>_Default value: 25_<br> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| page | `number` | <p>The page of results being returned</p> |
| limit | `number` | <p>The number of results per page</p> |
| has_more_threads | `boolean` | <p>Boolean indicating if there are more pages of threads</p> |
| has_more_boards | `boolean` | <p>Boolean indicating if there are more pages of boards</p> |
| threads | `object[]` | <p>An array containing watched thread data</p> |
| threads.id | `string` | <p>The unique id of the watched thread</p> |
| threads.post_count | `number` | <p>The post count of the watched thread</p> |
| threads.view_count | `number` | <p>The view count of the watched thread</p> |
| threads.board_name | `string` | <p>The name of the board the thread is in</p> |
| threads.title | `string` | <p>The title of the thread being watched</p> |
| boards | `object[]` | <p>An array containing watched board data</p> |
| boards.id | `string` | <p>The unique id of the watched board</p> |
| boards.name | `string` | <p>The name of the watched board</p> |
| boards.post_count | `number` | <p>The post count of the watched board</p> |
| boards.thread_count | `number` | <p>The thread count of the watched board</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue retrieving the watchlist threads.</p> |

## <a name='Watch-Board'></a> Watch Board
[Back to top](#top)

<p>Used to mark a user as watching a board.</p>

```
POST /watchlist/boards/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the board being watched</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue watching the board</p> |

## <a name='Watch-Thread'></a> Watch Thread
[Back to top](#top)

<p>Used to mark a user as watching a thread.</p>

```
POST /watchlist/threads/:id
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| id | `string` | <p>The unique id of the thread being watched</p> |

### Success response

#### Success response - `Success 200`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| status | `object` | <p>200 OK</p> |

### Error response

#### Error response - `Error 500`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| InternalServerError |  | <p>There was an issue watching the thread</p> |
