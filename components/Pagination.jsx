'use client'
import { useEffect, useState } from "react";

export default function Pagination(props){
    let {itemsPerPage, total, onPageChange,current, pages, hide_text, hide_goto} = props
    let currentPage = parseInt(current)
    const totalPages = pages || Math.ceil(total / itemsPerPage);
    let [page,setPage] = useState(current)
    let [pageNumbers,setPageNumbers] = useState([])
    const handlePageChange = (pageNumber) => {
      if (pageNumber !== currentPage) {
        onPageChange(pageNumber);
      }
    };
    useEffect(()=>{
      let i = 1
      let options = []
      while(i < (totalPages+1)){
        options.push(i)
       i++
      }
      setPageNumbers(options)
    },[current])
    const handlePreviousPage = () => {
      let new_page = Math.max(currentPage - 1, 1)
      onPageChange(new_page);
    };
    const handleNextPage = () => {
      let new_page = Math.min(currentPage) + 1, totalPages
      onPageChange(new_page);
    };
    
    const getPageNumbers = () => {
      const pageNumbers = [];
      const startPage = Math.max(currentPage - 1, 1);
      const endPage = Math.min(startPage + 2, totalPages);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            type="button"
            key={i}
            onClick={() => handlePageChange(i)}
            className={`pagination_btn ${currentPage == i ? ' bg-black text-white dark:border dark:border-green' : 'bg-white'}`}
          >
            {i}
          </button>
        );
      }
      return pageNumbers;
    };
    function handleChange(e){
      let page = e.target.value
      setPage(page)
    }
    function handleJumpToPage(){
      onPageChange(page);
    }
    return (
      <div className="flex items-center justify-between py-3 flex-col md:flex-row w-full">
          <div>
              {!hide_text && <p className="text-gray-500 text-xs font-normal dark:text-gray-200">{`Showing ${((currentPage-1) * itemsPerPage)+1}-${(currentPage * itemsPerPage) < total + 1 ? (currentPage * itemsPerPage) : total} of ${total}`}</p>}
          </div>
          <div className="flex items-center flex-col md:flex-row">
              <div className="flex items-center my-3 md:my-0">
                <button type="button" className="pagination_btn bg-white" onClick={handlePreviousPage} disabled={currentPage === 1}>
                Prev
                </button>
                {getPageNumbers()}
                <button type="button" className="pagination_btn bg-white" onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
                </button>
              </div>
              {!hide_goto && <div className="flex items-center justify-center gap-1 md:ml-3">
                <p className="text-gray-500 text-xs font-normal dark:text-gray-200">Go to Page</p>
                <input onChange={handleChange} className={`pagination_btn outline-0 w-[70px] text-center`} type="number" min={1} title={`Go to a page between 1 and ${totalPages}`} value={page}/>
                <p className="text-gray-500 text-xs font-normal dark:text-gray-200">/ {totalPages}</p>
                <button type="button" className="pagination_btn bg-white" onClick={handleJumpToPage} disabled={!page || parseInt(page) == currentPage || !pageNumbers.includes(parseInt(page))}>Go</button>
              </div>}
          </div>
      </div>
    );
  };