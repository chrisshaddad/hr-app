'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import ReactCountryFlag from 'react-country-flag';
import { updateOrganizationRequestSchema } from '@repo/contracts';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const countries = [
  { code: 'ID', dialCode: '+62', name: 'Indonesia' },
  { code: 'US', dialCode: '+1', name: 'United States' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom' },
  { code: 'IN', dialCode: '+91', name: 'India' },
  { code: 'LB', dialCode: '+961', name: 'Lebanon' },
  { code: 'AE', dialCode: '+971', name: 'UAE' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia' },
  { code: 'TR', dialCode: '+90', name: 'Turkey' },
  { code: 'FR', dialCode: '+33', name: 'France' },
  { code: 'PT', dialCode: '+351', name: 'Portugal' },
  { code: 'BR', dialCode: '+55', name: 'Brazil' },
  { code: 'JP', dialCode: '+81', name: 'Japan' },
];

// UI form schema - separates countryCode and contactNumber for better UX
const companyInfoFormSchema = z.object({
  companyName: z.string().min(2, {
    error: 'Company name must be at least 2 characters.',
  }),
  companyWebsite: z.url({
    error: 'Please enter a valid URL.',
  }),
  countryCode: z.string(),
  contactNumber: z.string().min(5, {
    error: 'Contact number must be at least 5 characters.',
  }),
  contactEmail: z.email({
    error: 'Please enter a valid email address.',
  }),
  companyOverview: z.string().optional(),
});

type CompanyInfoFormValues = z.infer<typeof companyInfoFormSchema>;

// Default values for demonstration
const defaultValues: CompanyInfoFormValues = {
  companyName: 'Unpixel Studio',
  companyWebsite: 'https://www.unpixel.co',
  countryCode: '+62',
  contactNumber: '83843578300',
  contactEmail: 'contact@unpixel.com',
  companyOverview:
    'Unpixel Studio could be a creative agency that offers a range of services such as branding, graphic design, web development, and digital marketing. With a team of talented and experienced designers, developers, and marketers, Dummy Studio would work closely with clients to develop unique and effective solutions to their branding and marketing needs.',
};

export default function CompanyInfoPage() {
  const form = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoFormSchema),
    defaultValues,
  });

  function onSubmit(data: CompanyInfoFormValues) {
    // Transform UI form data to backend format
    const payload = updateOrganizationRequestSchema.parse({
      name: data.companyName,
      website: data.companyWebsite,
      phone: `${data.countryCode}${data.contactNumber}`,
      email: data.contactEmail,
      overview: data.companyOverview,
    });

    toast.success('Company info updated', {
      description: 'Your changes have been saved successfully.',
    });
    console.log('UI Form Data:', data);
    console.log('Backend Payload:', payload);
  }

  return (
    <div className="flex flex-col">
      <div className="border-b px-6 py-5">
        <h2 className="text-lg font-semibold text-foreground">Company Info</h2>
      </div>
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Company Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Unpixel Studio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Company Website{' '}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.unpixel.co" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormItem>
                <FormLabel>
                  Contact Number <span className="text-destructive">*</span>
                </FormLabel>
                <div className="flex rounded-md border border-input shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => {
                      const selectedCountry = countries.find(
                        (c) => c.dialCode === field.value,
                      );
                      return (
                        <div className="w-[120px]">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-full w-full rounded-none border-0 shadow-none focus:ring-0">
                                <SelectValue>
                                  {selectedCountry && (
                                    <div className="flex items-center gap-2">
                                      <ReactCountryFlag
                                        countryCode={selectedCountry.code}
                                        svg
                                        style={{
                                          width: '1.25rem',
                                          height: '1.25rem',
                                        }}
                                      />
                                      <span>{selectedCountry.dialCode}</span>
                                    </div>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem
                                  key={country.code}
                                  value={country.dialCode}
                                >
                                  <div className="flex items-center gap-2">
                                    <ReactCountryFlag
                                      countryCode={country.code}
                                      svg
                                      style={{
                                        width: '1.25rem',
                                        height: '1.25rem',
                                      }}
                                    />
                                    <span>{country.dialCode}</span>
                                    <span className="text-muted-foreground text-xs">
                                      {country.name}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }}
                  />
                  <div className="h-auto w-px bg-input my-2" />
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormControl>
                        <Input
                          className="flex-1 rounded-none border-0 shadow-none focus-visible:ring-0"
                          placeholder="83843578300"
                          {...field}
                        />
                      </FormControl>
                    )}
                  />
                </div>
                <FormMessage>
                  {form.formState.errors.contactNumber?.message}
                </FormMessage>
              </FormItem>

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Contact Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="contact@unpixel.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companyOverview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Overview</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter company overview..."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="px-8"
                onClick={() => form.reset()}
                disabled={!form.formState.isDirty}
              >
                Discard
              </Button>
              <Button
                type="submit"
                size="lg"
                className="px-8"
                disabled={!form.formState.isDirty}
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
