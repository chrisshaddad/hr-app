'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CompanyInfoPage() {
  return (
    <>
      {' '}
      <div className="border-b p-6">
        <h2 className="text-lg font-medium">Company Info</h2>
      </div>
      <div className="p-6">
        <form className="space-y-6">
          {/* Company Name and Website */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company-name"
                placeholder="Unpixel Studio"
                defaultValue="Unpixel Studio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-website">
                Company Website <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company-website"
                placeholder="www.unpixel.co"
                defaultValue="www.unpixel.co"
              />
            </div>
          </div>

          {/* Contact Number and Email */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-number">
                Contact Number <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Select defaultValue="+62">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+62">+62</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+91">+91</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="contact-number"
                  placeholder="83843578300"
                  defaultValue="83843578300"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">
                Contact Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="contact@unpixel.com"
                defaultValue="contact@unpixel.com"
              />
            </div>
          </div>

          {/* Company Overview */}
          <div className="space-y-2">
            <Label htmlFor="company-overview">Company Overview</Label>
            <Textarea
              id="company-overview"
              rows={6}
              placeholder="Enter company overview..."
              defaultValue="Unpixel Studio could be a creative agency that offers a range of services such as branding, graphic design, web development, and digital marketing. With a team of talented and experienced designers, developers, and marketers, Dummy Studio would work closely with clients to develop unique and effective solutions to their branding and marketing needs."
            />
          </div>

          {/* Save Button */}
          <div>
            <Button size="lg" className="px-8">
              Save
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
