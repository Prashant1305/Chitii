

function infiniteScroll(elementRef, loadMoreHandler, chatId) {


    elementRef.current.addEventListener("scroll", () => {

        handleInfiniteScroll(elementRef, loadMoreHandler, chatId)
    })

}
const handleInfiniteScroll = (elementRef, loadMoreHandler, chatId) => {

    if (elementRef.current?.scrollTop <= 2) {
        loadMoreHandler(chatId);
    }
}

export default infiniteScroll