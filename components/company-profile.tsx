import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface CompanyProfileProps {
  profile: any
}

export function CompanyProfile({ profile }: CompanyProfileProps) {
  if (!profile) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{profile.company_name}</CardTitle>
        <CardDescription>Company Profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Industry</h3>
            <p>{profile.industry}</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Business Model</h3>
            <p>{profile.business_model}</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Company Size</h3>
            <p>{profile.company_size}</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Founding Date</h3>
            <p>{profile.founding_date}</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
            <p>{profile.location}</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Annual Revenue</h3>
            <p>${profile.annual_revenue.toLocaleString()}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Products & Services</h3>
          <div className="flex flex-wrap gap-2">
            {profile.products_services.map((service: string, index: number) => (
              <Badge key={index} variant="outline">
                {service}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Financial Accounts</h3>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Bank Accounts</h4>
            <div className="grid gap-2">
              {profile.account_structures.bank_accounts.map((account: any, index: number) => (
                <div key={index} className="rounded-md border p-3">
                  <div className="font-medium">{account.account_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {account.bank_name} • {account.account_type}
                  </div>
                  <div className="text-sm mt-1">Starting Balance: ${account.starting_balance.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Credit Cards</h4>
            <div className="grid gap-2">
              {profile.account_structures.credit_cards.map((card: any, index: number) => (
                <div key={index} className="rounded-md border p-3">
                  <div className="font-medium">{card.card_name}</div>
                  <div className="text-sm text-muted-foreground">{card.issuer}</div>
                  <div className="text-sm mt-1">Credit Limit: ${card.credit_limit.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

