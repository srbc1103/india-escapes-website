'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Upload, Trash2, Save, File, Download } from 'lucide-react';
import Data from '../../../../lib/backend';
import Pagination from '../../../../components/Pagination';
import { COLLECTIONS } from '../../../../constants';
import MediaItem, { MediaItemSkeleton } from '../../../../components/MediaItem';
import PageHead from '../../../../components/PageHead';
import { downloadCSV } from '../../../../functions';
import Button from '../../../../components/Buttons';

export default function MediaPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [mediaList, setMediaList] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loadingMedia, setLoadingMedia] = useState({});

  useEffect(() => {
    fetchMediaList();
  }, [currentPage]);

  const fetchMediaList = async () => {
    const offset = (currentPage - 1) * itemsPerPage;
    setLoadingMedia(true)
    Data.list_files({
      limit: itemsPerPage,
      offset,
    }).then(d=>{
      let {status,message} = d
      if(status == 'success'){
        setMediaList(d.files);
        setTotal(d.total);
      }else{
        toast.error(message);
      }
    }).catch(err=>{
      toast.error(err.message);
    }).finally(()=>{
      setLoadingMedia(false)
    })
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('No files selected');
      return;
    }
    setUploading(true);
    const progress = {};
    files.forEach((file) => (progress[file.name] = 0));
    setUploadProgress(progress);

    try {
      for (const file of files) {
        const upload = new Promise((resolve) => {
          const interval = setInterval(() => {
            setUploadProgress((prev) => {
              const newProgress = Math.min(prev[file.name] + 10, 90);
              if (newProgress >= 90) clearInterval(interval);
              return { ...prev, [file.name]: newProgress };
            });
          }, 200);

          Data.create_file({
            file,
            metadata: { title: '', alt: '', description: '' },
          }).then((response) => {
            clearInterval(interval);
            setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
            if (response.status !== 'success') {
              toast.error(`Failed to upload ${file.name}: ${response.message}`);
            }
            resolve();
          });
        });
        await upload;
      }
      toast.success('Files uploaded successfully');
      fetchMediaList();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setFiles([]);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch all media metadata
      const response = await Data.get_all_items_for_export({
        collection_id: COLLECTIONS.MEDIA_METADATA
      });

      if (response.status === 'success' && response.items.length > 0) {
        downloadCSV(response.items, 'media.csv');
        toast.success('Data exported successfully!');
      } else {
        toast.error('No data to export');
      }
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full py-8 px-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <PageHead text="Media Library"/>
          {/* <Button
            onClick={handleExport}
            styles="text-sm bg-green-600 hover:bg-green-700"
            disabled={exporting || total === 0}
          >
            <Download size={16} className="mr-1" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button> */}
        </div>

        {/* Upload Section */}
        <div className="bg-gray-100/40 dark:bg-gray-800 rounded-xl mb-8 border border-dashed p-4 lg:p-6 md:w-sm lg:w-md border-gray-300">
          <h2 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-200">Upload Media</h2>
          <input
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={handleFileChange}
            className="mb-2 p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 cursor-pointer text-xs hover:bg-gray-100/70 transition duration-300"
          />
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className={`px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 flex items-center gap-2 text-sm ${
              files.length == 0 || uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload size={18} />
            {files.length == 0 ? 'Browse Files' : 'Upload Files'}
          </button>
          {uploading && (
            <div className="mt-4 max-w-2xl">
              {files.map((file) => (
                <div key={file.name} className="mb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{file.name}</p>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-md h-2">
                    <div
                      className="bg-black h-2 rounded-md"
                      style={{ width: `${uploadProgress[file.name] || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media List */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {loadingMedia ? <>
          <MediaItemSkeleton/>
          <MediaItemSkeleton/>
          <MediaItemSkeleton/>
        </> :
        <>
          {mediaList.map((media,index) => (
            <MediaItem key={index} {...media} reload={fetchMediaList}/>
          ))}
        </>
        }
        </div>

        {/* Pagination */}
        {total > itemsPerPage && (
          <div className="mt-8">
            <Pagination
              itemsPerPage={itemsPerPage}
              total={total}
              current={currentPage}
              onPageChange={n=>{
                setCurrentPage(n)
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}