# BYOV - Build Your Own Verse

## New Features Added

### 1. Private Verses
- Authors can now mark verses as private when creating or editing posts
- Private verses are only visible to the author
- Access the private verses from the navbar under "Private" link
- Private verses appear in a dedicated page showing all your private writings
- Attempting to access a private verse without authorization shows an access denied message

### 2. User Search
- Search for other users by their username
- Click the search icon in the navbar to open the search bar
- View user profiles and their public verses
- Search results show user avatar, name, and bio
- Navigate directly to user profiles from search results

### 3. Rainforest Aesthetic Redesign
- Soft green color palette inspired by rainforest coziness
- Updated colors:
  - Primary: Deep forest green (#2d3d38)
  - Accent: Soft sage green (#7fb69f)
  - Secondary: Light mint (#d4e8e0)
  - Background: Warm cream (#f5f9f7)
- Smooth animations including floating and swaying effects
- Enhanced visual hierarchy with improved contrast
- Cozy, minimal design perfect for writers and readers
- Dark mode support with rainforest-inspired dark palette

## How to Use

### Creating a Private Verse
1. Click "Create" in the navbar
2. Write your title and content
3. Check the "Keep this verse private" checkbox
4. Click "Publish"

### Accessing Private Verses
1. Click "Private" in the navbar
2. View all your private verses in one place
3. Click any verse to read the full content

### Searching for Users
1. Click the search icon in the navbar
2. Type a username
3. Click "Search" or press Enter
4. Click on a user to view their profile and public verses

## Database Schema Updates

Posts collection now includes:
- `isPrivate` (boolean): Whether the verse is private
- All existing fields remain unchanged

## Technical Details

- Private verses are filtered from the home feed using Firestore queries
- Access control is enforced on the post detail page
- Search uses Firestore's string comparison for username matching
- All features maintain the existing authentication system
