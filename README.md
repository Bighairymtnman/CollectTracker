# CollectTracker

A desktop application for collectors to organize, track, and showcase their collections.

## Documentation

For full documentation, user guides, and screenshots, visit our [documentation website](https://bighairymtnman.github.io/CollectTracker-docs/).

## Download

Download the latest version of CollectTracker from our [releases page](https://github.com/Bighairymtnman/CollectTracker/releases/latest).

## Features

- **Collection Management**: Create and organize multiple collections
- **Item Tracking**: Add detailed information about each item in your collections
- **Photo Gallery**: Attach and view multiple photos for each item
- **Categorization**: Organize items with custom categories
- **Search & Sort**: Easily find items across your collections
- **Value Tracking**: Monitor the value of your collections over time

## Technology Stack

- **Frontend**: React.js, HTML5, CSS3, JavaScript
- **Backend**: Express.js, SQLite
- **Desktop Framework**: Electron

## Project Structure

```
CollectTracker/
├── build/
│   └── icon.ico                     # Application icon for Windows
│
├── client/                          # React Frontend
│   ├── build/                       # Production build of React app
│   ├── node_modules/                # Frontend dependencies
│   ├── public/
│   │   ├── index.html              # Main HTML template
│   │   ├── logos                   # App logos
│   │   └── electron.js             # Electron configuration
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── AddCollectionForm   # Form for new collections
│   │   │   ├── AddItemForm         # Form for new items
│   │   │   ├── CategoryItem        # Category display component
│   │   │   ├── CategoryModal       # Category management modal
│   │   │   ├── CollectionList      # Collections overview
│   │   │   ├── CollectionPage      # Single collection view
│   │   │   ├── CollectionValue     # Value display component
│   │   │   ├── EditItemModal       # Item editing modal
│   │   │   ├── ItemCard           # Individual item display
│   │   │   ├── MainLayout         # App layout wrapper
│   │   │   ├── PhotoGalleryModal  # Photo viewer
│   │   │   ├── SearchSortControls # Search/sort interface
│   │   │   └── Sidebar           # Navigation sidebar
│   │   ├── App.js                 # Main React component
│   │   ├── index.js               # React entry point
│   │   └── config.js              # Frontend configuration
│   ├── package.json               # Frontend dependencies/scripts
│   └── package-lock.json          # Frontend dependency lock
│
├── server/                         # Express Backend
│   ├── database/
│   │   └── collecttracker.db      # SQLite database
│   ├── routes/
│   │   ├── categories.js          # Category endpoints
│   │   └── collections.js         # Collection endpoints
│   ├── utils/
│   │   └── initDb.js             # Database initialization
│   ├── .env                       # Environment variables
│   ├── db.config.js              # Database configuration
│   ├── index.js                  # Backend entry point
│   └── package.json              # Backend dependencies
│
├── main.js                        # Electron main process
└── package.json                   # Main app configuration
```

## Installation

### For Users

Download the latest release from the [Releases page](https://github.com/Bighairymtnman/CollectTracker/releases/latest).

### For Developers

1. Clone the repository:
   ```
   git clone https://github.com/Bighairymtnman/CollectTracker.git
   cd CollectTracker
   ```

2. Install dependencies:
   ```
   npm install
   cd client
   npm install
   cd ../server
   npm install
   cd ..
   ```

3. Run in development mode:
   ```
   npm run dev
   ```

## Building from Source

To build the application:

```
cd client
npm run build
cd ..
npm run package
```

This will create executables in the `dist` folder.

## Usage

1. **Create a Collection**: Start by creating a new collection (e.g., "Books", "Coins", "Records")
2. **Add Items**: Add items to your collection with details like name, description, value, and photos
3. **Organize with Categories**: Create categories to organize your items
4. **Search and Filter**: Use the search and filter tools to find specific items

## Learning Resources with Code Examples

Detailed breakdowns of the technologies and patterns used in this project:

- [SQLiteNode Example](https://github.com/Bighairymtnman/SQLiteNode-Reference/blob/main/CollectTrackerSQLiteNodeExample.md)
- [Electron Example](https://github.com/Bighairymtnman/Electron.js-Reference/blob/main/CollectTrackerElectronExample.md)
- [React Example](https://github.com/Bighairymtnman/React-Reference/blob/main/CollectTrackerReactExample.md)
- [Express Example](https://github.com/Bighairymtnman/Express.js-Reference/blob/main/CollectTrackerExpressExample.md)



## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [SQLite](https://www.sqlite.org/)

## Links

- [Documentation Website](https://bighairymtnman.github.io/CollectTracker-docs/)
- [Download Application](https://github.com/Bighairymtnman/CollectTracker/releases/latest)
- [Report Issues](https://github.com/Bighairymtnman/CollectTracker/issues)

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

