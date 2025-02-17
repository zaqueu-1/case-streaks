export default function StatsCard({icon, title, stat, keyword}) {
    return (
        <div className='bg-primary_muted overflow-hidden shadow aspect-square rounded-lg max-w-[180px] w-full hover:scale-105 transition duration-300 ease-in-out'>
            <div className='h-full flex flex-col items-center justify-center p-4 gap-1'>
                <span className='text-5xl'>
                    {icon}
                </span>
                <span className='text-[10px] mt-4 font-light font-poppins text-secondary'>
                    {title}
                </span>
                <span className='text-xl font-semibold font-montserrat text-secondary'>
                    {stat || 0} {stat == 1 ? keyword : (keyword + "s")}
                </span>
            </div>
        </div>

    )
}
