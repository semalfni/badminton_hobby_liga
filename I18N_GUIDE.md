# 🌍 Internationalization (i18n) Implementation Guide

Your Badminton Liga app now supports **English** and **German** languages!

## ✅ What's Been Completed

### 1. Installed Packages
- `i18next` - Core i18n framework
- `react-i18next` - React bindings for i18n

### 2. Translation Files Created
- `src/locales/en.json` - English translations (default)
- `src/locales/de.json` - German translations (Deutsch)

### 3. Configuration
- `src/i18n.ts` - i18n configuration with language detection
- Language preference saved to localStorage
- Auto-loads saved language on app start

### 4. Components
- `src/components/LanguageSwitcher.tsx` - EN/DE toggle button
- Added to navigation bar
- Added to login page

### 5. Pages Updated with Translations
- ✅ `App.tsx` - Navigation menu, user info, logout
- ✅ `Login.tsx` - Complete translation support

### 6. Pages Ready for Translation (Template Provided)
- `Standings.tsx`
- `Teams.tsx`
- `Players.tsx`
- `Matches.tsx`
- `MatchDetail.tsx`
- `Statistics.tsx`
- `Users.tsx`

## 🚀 How to Use Translations in Components

### Basic Usage

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>{t('teams.title')}</p>
    </div>
  );
}
```

### With Pluralization

```typescript
// Automatically handles singular/plural
<p>{t('teams.playerCount', { count: playerCount })}</p>

// English: "5 players"
// German: "5 Spieler"
```

### With Interpolation

```typescript
<p>{t('matchDetail.pairNumber', { number: 5 })}</p>
// Output: "Pair 5" or "Paarung 5"
```

## 📝 Translation Keys Reference

### Common Keys
```typescript
t('common.appName')        // "Badminton Liga"
t('common.logout')         // "Logout" / "Abmelden"
t('common.save')           // "Save" / "Speichern"
t('common.cancel')         // "Cancel" / "Abbrechen"
t('common.edit')           // "Edit" / "Bearbeiten"
t('common.delete')         // "Delete" / "Löschen"
t('common.loading')        // "Loading..." / "Laden..."
```

### Navigation
```typescript
t('nav.standings')         // "Standings" / "Tabelle"
t('nav.teams')             // "Teams" / "Teams"
t('nav.players')           // "Players" / "Spieler"
t('nav.matches')           // "Matches" / "Spiele"
t('nav.statistics')        // "Statistics" / "Statistiken"
t('nav.users')             // "Users" / "Benutzer"
```

### Teams
```typescript
t('teams.title')           // "Teams" / "Teams"
t('teams.addTeam')         // "Add Team" / "Team hinzufügen"
t('teams.teamName')        // "Team Name" / "Teamname"
t('teams.homeDay')         // "Home Day" / "Heimspieltag"
t('teams.homeTime')        // "Home Time" / "Heimspielzeit"
t('teams.address')         // "Address" / "Adresse"
```

### Players
```typescript
t('players.title')         // "Players" / "Spieler"
t('players.addPlayer')     // "Add Player" / "Spieler hinzufügen"
t('players.playerName')    // "Player Name" / "Spielername"
t('players.selectTeam')    // "Select Team" / "Team auswählen"
```

### Matches
```typescript
t('matches.title')         // "Matches" / "Spiele"
t('matches.homeTeam')      // "Home Team" / "Heimteam"
t('matches.awayTeam')      // "Away Team" / "Auswärtsteam"
t('matches.matchDate')     // "Match Date" / "Spieldatum"
t('matches.location')      // "Location" / "Ort"
t('matches.completed')     // "Completed" / "Abgeschlossen"
t('matches.inProgress')    // "In Progress" / "In Bearbeitung"
t('matches.vs')            // "VS" / "gegen"
```

### Statistics
```typescript
t('statistics.title')      // "Player Statistics" / "Spielerstatistiken"
t('statistics.gamesPlayed')// "Games Played" / "Spiele"
t('statistics.gamesWon')   // "Games Won" / "Siege"
t('statistics.totalPoints')// "Total Points" / "Gesamtpunkte"
t('statistics.winRate')    // "Win Rate" / "Siegquote"
```

## 🔧 How to Add Translations to Remaining Pages

### Step 1: Import useTranslation

```typescript
import { useTranslation } from 'react-i18next';

function YourPage() {
  const { t } = useTranslation();
  // ... rest of component
}
```

### Step 2: Replace Hard-coded Text

**Before:**
```typescript
<h1>Teams</h1>
<button>Add Team</button>
<label>Team Name</label>
```

**After:**
```typescript
<h1>{t('teams.title')}</h1>
<button>{t('teams.addTeam')}</button>
<label>{t('teams.teamName')}</label>
```

### Step 3: Handle Confirm Dialogs

**Before:**
```typescript
if (window.confirm('Are you sure you want to delete this team?')) {
  // delete
}
```

**After:**
```typescript
if (window.confirm(t('teams.confirmDelete'))) {
  // delete
}
```

## 📋 Translation Checklist for Each Page

### Standings Page
- [x] Page title
- [ ] Table headers (Team, P, W, D, L, Points, etc.)
- [ ] Loading state
- [ ] No data message

### Teams Page  
- [ ] Page title
- [ ] Add Team button
- [ ] Form labels (Team Name, Home Day, Home Time, Address)
- [ ] Edit/Delete buttons
- [ ] Player count display
- [ ] Confirm delete message

### Players Page
- [ ] Page title
- [ ] Add Player button
- [ ] Form labels (Player Name, Select Team)
- [ ] Team filter dropdown
- [ ] Edit/Delete buttons
- [ ] Confirm delete message

### Matches Page
- [ ] Page title
- [ ] Add Match button
- [ ] Form labels (Home Team, Away Team, Date, Location)
- [ ] Status badges (Completed, In Progress)
- [ ] View Details button
- [ ] Confirm delete message

### Match Detail Page
- [ ] Back to Matches button
- [ ] Player Nominations section
- [ ] Show/Hide Nominations button
- [ ] Nominate/Unnominate buttons
- [ ] Auto-Generate Pairs button
- [ ] Pair numbers
- [ ] Form labels (Player 1, Player 2, Game 1, 2, 3)
- [ ] Home/Away labels
- [ ] Total points display
- [ ] Mark Completed / Reopen buttons

### Statistics Page
- [ ] Page title
- [ ] Table headers
- [ ] Summary cards (Most Points, Best Win Rate, Most Active)
- [ ] No data message

### Users Page
- [ ] Page title
- [ ] Add User button
- [ ] Form labels (Username, Password, Role, Assigned Team)
- [ ] Role options (Admin, Team Manager)
- [ ] Edit/Delete buttons
- [ ] Confirm delete message

## 🎨 Language Switcher Styling

The language switcher is automatically styled to match your app's theme:
- Light/Dark mode support
- Active language highlighted in blue
- Inactive languages in gray
- Hover effects

## 🔄 Testing Translations

1. Start the app: `npm run dev`
2. Click EN/DE buttons in navigation
3. Verify all text changes language
4. Check that language persists on page refresh

## 📖 Adding New Translation Keys

### 1. Add to en.json
```json
{
  "mySection": {
    "myKey": "English text"
  }
}
```

### 2. Add to de.json
```json
{
  "mySection": {
    "myKey": "Deutscher Text"
  }
}
```

### 3. Use in Component
```typescript
{t('mySection.myKey')}
```

## 🌟 Best Practices

1. **Group Related Keys**: Use sections like `teams`, `players`, `matches`
2. **Reuse Common Keys**: Use `common` for shared text like buttons
3. **Test Both Languages**: Ensure layout works with longer German text
4. **Use Interpolation**: For dynamic content like `"Pair {{number}}"`
5. **Handle Plurals**: Use `_plural` suffix for plural forms

## 🚀 Quick Example: Updating Standings Page

```typescript
// src/pages/Standings.tsx
import { useTranslation } from 'react-i18next';

function Standings() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('standings.title')}</h1>
      <table>
        <thead>
          <tr>
            <th>{t('standings.team')}</th>
            <th>{t('standings.played')}</th>
            <th>{t('standings.wins')}</th>
            <th>{t('standings.draws')}</th>
            <th>{t('standings.losses')}</th>
            <th>{t('standings.points')}</th>
          </tr>
        </thead>
        {/* ... rest of table */}
      </table>
    </div>
  );
}
```

## ✅ What's Next

1. Apply translations to remaining pages using the examples above
2. Test both languages thoroughly
3. Adjust German translations if needed (some may need refinement)
4. Consider adding more languages in the future (French, Spanish, etc.)

## 🎉 Benefits

- ✅ **Better User Experience**: Users can choose their preferred language
- ✅ **Market Expansion**: Support for German-speaking leagues
- ✅ **Easy to Extend**: Simple to add more languages
- ✅ **Persistent**: Language choice saved locally
- ✅ **No Backend Changes**: All client-side

Your app is now ready for international use! 🌍🏸
