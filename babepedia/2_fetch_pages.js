process.stdin
    .pipe(split())
    .pipe(new Fan(
        5, UrlFetcher)
    )
    .pipe(new PageDump('../data/babepedia/pages', '.html'))
;