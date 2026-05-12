import { SurveyFlow } from '@/pages/SurveyFlow';

/**
 * App — Root component for the ElderGuideSurvey micro-app.
 *
 * Why no React Router:
 * This is a single-screen flow driven by URL query params, not path segments.
 * Adding a router would be unnecessary complexity for a micro-app.
 */
function App() {
  return (
    <div className="app-wrapper">
      <SurveyFlow />
    </div>
  );
}

export default App;
