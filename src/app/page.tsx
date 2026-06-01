import { FeatureEnabled } from '@/components/FeatureEnabled'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

const cards = [
  {
    featureFlag: 'TEST_NEW_PRODUCTS_QUERY' as const,
    badge: 'New',
    badgeVariant: 'default' as const,
    image: 'https://avatar.vercel.sh/products',
    title: 'Product Management',
    description:
      'Explore the revamped product catalogue with faster queries and improved filtering.',
    buttonLabel: 'Browse Products',
  },
  {
    featureFlag: 'ADVANCED_ANALYTICS' as const,
    badge: 'Beta',
    badgeVariant: 'secondary' as const,
    image: 'https://avatar.vercel.sh/analytics',
    title: 'Advanced Analytics',
    description:
      'Deep-dive into user behaviour, conversion funnels, and retention metrics in real time.',
    buttonLabel: 'Open Dashboard',
  },
  {
    featureFlag: 'EXPERIMENTAL_FEATURE' as const,
    badge: 'Experimental',
    badgeVariant: 'outline' as const,
    image: 'https://avatar.vercel.sh/experiment',
    title: 'AI Recommendations',
    description:
      'Personalised product suggestions powered by our new machine-learning pipeline.',
    buttonLabel: 'Try It Out',
  },
  {
    featureFlag: 'MULTIPLE_ALLOWANCES' as const,
    badge: 'Pro',
    badgeVariant: 'default' as const,
    image: 'https://avatar.vercel.sh/allowances',
    title: 'Multiple Allowances',
    description:
      'Manage spending limits across teams and projects with fine-grained role controls.',
    buttonLabel: 'Manage Allowances',
  },
  {
    featureFlag: 'DISABLED_FEATURE' as const,
    badge: 'Featured',
    badgeVariant: 'secondary' as const,
    image: 'https://avatar.vercel.sh/shadcn1',
    title: 'Design Systems Meetup',
    description:
      'A practical talk on component APIs, accessibility, and shipping faster.',
    buttonLabel: 'View Event',
  },
]

export default function Home() {
  return (
    <div className='container mx-auto my-10 px-4'>
      <h1 className='mb-8 text-2xl font-semibold tracking-tight'>
        Feature Flags Demo
      </h1>
      <div className='flex flex-wrap gap-6'>
        {cards.map(
          ({ featureFlag, badge, badgeVariant, image, title, description, buttonLabel }) => (
            <FeatureEnabled key={featureFlag} featureFlag={featureFlag}>
              <Card className='group relative mx-auto w-full max-w-sm overflow-hidden pt-0 transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-lg'>
                <div className='absolute inset-0 z-30 aspect-video bg-black/35' />
                <img
                  src={image}
                  alt={title}
                  className='relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40'
                />
                <CardHeader>
                  <Badge variant={badgeVariant} className='w-fit'>
                    {badge}
                  </Badge>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className='w-full'>{buttonLabel}</Button>
                </CardFooter>
              </Card>
            </FeatureEnabled>
          ),
        )}
      </div>
    </div>
  )
}
