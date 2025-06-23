# Warehouse 3D Management

A Next.js application for 3D warehouse management with modern UI components.

## Features

- 3D warehouse visualization
- Pallet and product management
- Modern UI with Tailwind CSS and Radix UI components
- Responsive design with mobile support

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/warehouse-3d-management.git
cd warehouse-3d-management
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run export` - Build and export static files

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages via GitHub Actions.

#### Setup Instructions:

1. **Enable GitHub Pages:**

   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Source", select "GitHub Actions"

2. **Configure Repository:**

   - Make sure your repository is public (or you have GitHub Pro for private repos)
   - The `basePath` in `next.config.mjs` should match your repository name

3. **Deploy:**
   - Push to the `main` branch
   - GitHub Actions will automatically build and deploy your site
   - Your site will be available at: `https://YOUR_USERNAME.github.io/warehouse-3d-management/`

#### Custom Domain (Optional):

If you want to use a custom domain:

1. Add a `CNAME` file to the `public` directory with your domain name
2. Configure your DNS settings to point to GitHub Pages
3. Update the `basePath` and `assetPrefix` in `next.config.mjs` accordingly

### Manual Deployment

To deploy manually:

```bash
npm run build
```

The static files will be generated in the `out` directory.

## GitHub Actions Workflows

- **CI** (`.github/workflows/ci.yml`): Runs on every push and pull request to test the build
- **Deploy** (`.github/workflows/deploy.yml`): Deploys to GitHub Pages on push to main branch

## Technology Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **3D Graphics:** React Three Fiber
- **Package Manager:** npm
- **Deployment:** GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
