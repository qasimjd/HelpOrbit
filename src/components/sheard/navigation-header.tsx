"use client"

import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage,
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"

interface NavigationHeaderProps {
  organizationSlug?: string
  organizationName?: string
  className?: string
}

interface BreadcrumbItem {
  label: string
  href?: string
  isCurrentPage?: boolean
}

const NavigationHeader = ({ 
  organizationSlug, 
  organizationName,
  className 
}: NavigationHeaderProps) => {
  const pathname = usePathname()

  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    if (!organizationSlug || !pathname.includes('/org/')) {
      return [{ label: 'Dashboard', isCurrentPage: true }]
    }

    const pathSegments = pathname.split('/').filter(Boolean)
    const orgIndex = pathSegments.indexOf('org')
    
    if (orgIndex === -1) {
      return [{ label: 'Dashboard', isCurrentPage: true }]
    }

    const items: BreadcrumbItem[] = []

    // Organization root - only add href if we have a valid organizationSlug
    items.push({
      label: organizationName || 'Organization',
      href: organizationSlug ? `/org/${organizationSlug}/dashboard` : undefined
    })

    // Process segments after /org/[slug]
    const dashboardSegments = pathSegments.slice(orgIndex + 2)
    
    if (dashboardSegments.length === 0 || dashboardSegments[0] === 'dashboard') {
      // We're at the dashboard root
      if (dashboardSegments.length === 1) {
        items.push({
          label: 'Dashboard',
          isCurrentPage: true
        })
      } else {
        items.push({
          label: 'Dashboard',
          href: `/org/${organizationSlug}/dashboard`
        })
        
        // Handle dashboard sub-routes
        const subRoute = dashboardSegments[1]
        const subRouteSegments = dashboardSegments.slice(1)
        
        switch (subRoute) {
          case 'tickets':
            items.push({
              label: 'Tickets',
              href: subRouteSegments.length === 1 
                ? undefined 
                : `/org/${organizationSlug}/dashboard/tickets`,
              isCurrentPage: subRouteSegments.length === 1
            })
            
            if (subRouteSegments.length > 1) {
              const ticketAction = subRouteSegments[1]
              if (ticketAction === 'new') {
                items.push({
                  label: 'Create Ticket',
                  isCurrentPage: true
                })
              } else {
                // Assume it's a ticket ID
                items.push({
                  label: `Ticket #${ticketAction}`,
                  isCurrentPage: subRouteSegments.length === 2
                })
              }
            }
            break
            
          case 'members':
            items.push({
              label: 'Members',
              isCurrentPage: true
            })
            break
            
          case 'settings':
            items.push({
              label: 'Settings',
              isCurrentPage: true
            })
            break
            
          default:
            // Generic handling for unknown routes
            const formattedLabel = subRoute
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
            items.push({
              label: formattedLabel,
              isCurrentPage: true
            })
        }
      }
    }

    return items
  }, [pathname, organizationSlug, organizationName])

  return (
    <header className={`flex h-8 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ${className || ''}`}>
      <div className="px-6">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem className="hidden md:flex text-xs">
                  {item.isCurrentPage ? (
                    <BreadcrumbPage>
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      href={item.href || '#'}
                      className="hover:text-foreground"
                    >
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}

export default NavigationHeader
