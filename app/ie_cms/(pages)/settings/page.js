'use client';

import Button from '../../../../components/Buttons';
import PageHead from '../../../../components/PageHead';
import Data from '../../../../lib/backend';
import { COLLECTIONS } from '../../../../constants';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '../../../../components/ui/skeleton';
import { TextArea } from '../../../../components/Input';
import { Query } from 'appwrite';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [robots, setRobots] = useState(`# robots.txt – edit below
User-agent: *
Disallow:`);

  useEffect(() => {
    Data.get_items_list({
      collection_id: COLLECTIONS.SETTINGS,
      queries: [Query.equal('key', 'robots_txt')],
      limit: 1,
    })
      .then(res => {
        if (res.documents && res.documents[0] && res.documents[0].value) {
          setRobots(res.documents[0].value);
        }
      })
      .catch(() => toast.error('Failed to load robots.txt'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);

    const listRes = await Data.get_items_list({
      collection_id: COLLECTIONS.SETTINGS,
      queries: [Query.equal('key', 'robots_txt')],
      limit: 1,
    });

    const doc = listRes.documents && listRes.documents[0];

    const payload = { key: 'robots_txt', value: robots.trim() };

    try {
      if (doc) {
        await Data.update_item({
          collection_id: COLLECTIONS.SETTINGS,
          document_id: doc.id,
          item_data: payload,
        });
      } else {
        await Data.create_item({
          collection_id: COLLECTIONS.SETTINGS,
          item_data: payload,
        });
      }
      toast.success('robots.txt saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full py-8 px-2">
      <PageHead text="SEO Settings" />
      <div className="max-w-3xl mt-8">
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <>
            <label className="block text-sm font-medium mb-2">robots.txt</label>
            <TextArea
              rows={20}
              value={robots}
              onChange={e => setRobots(e.target.value)}
              placeholder="# Add your robots.txt rules here"
            />
            <div className="mt-4">
              <Button
                onClick={save}
                disabled={saving}
                styles="px-5 py-2 bg-black text-white rounded-lg hover:bg-black/80"
              >
                {saving ? 'Saving...' : 'Save robots.txt'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}