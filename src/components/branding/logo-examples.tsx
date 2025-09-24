// Example usage of the enhanced LogoWithText component

import { 
  LogoWithText, 
  OrgLogoWithText, 
  CompactOrgLogo, 
  FullBrandingLogo 
} from '@/components/branding/branded-logo'

export function LogoExamples() {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold mb-4">Logo with Text Examples</h2>
      
      {/* Basic horizontal layout */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Horizontal Layout</h3>
        <LogoWithText 
          size="md" 
          orientation="horizontal" 
          showTagline={false} 
        />
      </div>

      {/* Vertical layout with tagline */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Vertical with Tagline</h3>
        <LogoWithText 
          size="lg" 
          orientation="vertical" 
          showTagline={true} 
        />
      </div>

      {/* Interactive logo */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Interactive Logo</h3>
        <LogoWithText 
          size="md" 
          orientation="horizontal" 
          interactive={true}
          onClick={() => console.log('Logo clicked!')}
        />
      </div>

      {/* Text only (no logo) */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Text Only</h3>
        <LogoWithText 
          size="md" 
          orientation="horizontal" 
          showLogo={false}
          showTagline={true}
        />
      </div>

      {/* Convenience components */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Convenience Components</h3>
        
        <div className="space-y-2">
          <h4 className="font-medium">Compact (for headers)</h4>
          <CompactOrgLogo />
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Full Branding (for landing pages)</h4>
          <FullBrandingLogo />
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Organization Logo with Text</h4>
          <OrgLogoWithText 
            size="md" 
            orientation="horizontal" 
            showTagline={false} 
          />
        </div>
      </div>
    </div>
  )
}