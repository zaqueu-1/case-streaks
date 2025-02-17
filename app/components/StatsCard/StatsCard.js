export default function StatsCard({icon, title, stat, keyword}) {
    return (
        <div className='bg-white overflow-hidden shadow aspect-square rounded-xl max-w-[120px] w-full hover:scale-105 hover:bg-primary_muted transition duration-300 ease-in-out'>
            <div className='h-full flex flex-col items-center justify-center p-2 gap-1'>
                <span className='text-4xl'>
                    {icon}
                </span>
                <span className='text-[10px] mt-2 font-light font-poppins text-secondary'>
                    {title}
                </span>
                <span className='text-lg font-semibold font-montserrat text-secondary'>
                    {stat || 0} {stat == 1 ? keyword : (keyword + "s")}
                </span>
            </div>
        </div>

    )
}
